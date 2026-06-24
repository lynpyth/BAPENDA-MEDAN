import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/services/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await prisma.taxSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nik: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Role-based check: Users can only see their own submissions
    if (session.user.role === "USER" && submission.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSION_INDIVIDUAL_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, reviewNotes, title, description, documentUrl } = await req.json();

    const submission = await prisma.taxSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const oldData = { ...submission };

    // If regular USER
    if (session.user.role === "USER") {
      if (submission.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (submission.status !== "PENDING") {
        return NextResponse.json({ error: "Pengajuan yang sedang diproses tidak dapat diubah" }, { status: 400 });
      }

      const updated = await prisma.taxSubmission.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(documentUrl !== undefined && { documentUrl }),
        },
      });

      // Log update
      await AuditService.log({
        action: "UPDATE",
        table: "TaxSubmission",
        recordId: id,
        userId: session.user.id,
        oldValue: oldData,
        newValue: updated,
      });

      return NextResponse.json(updated);
    }

    // For ADMIN / OFFICER (Reviewer)
    if (!["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedData: any = {};
    if (status !== undefined) updatedData.status = status;
    if (reviewNotes !== undefined) updatedData.reviewNotes = reviewNotes;

    const updated = await prisma.taxSubmission.update({
      where: { id },
      data: updatedData,
    });

    // Write to audit log
    await AuditService.log({
      action: "UPDATE",
      table: "TaxSubmission",
      recordId: id,
      userId: session.user.id,
      oldValue: oldData,
      newValue: updated,
    });

    // Notify user if status changed
    if (status && status !== oldData.status) {
      let statusLabel = "";
      let typeLabel = status === "APPROVED" ? "SUCCESS" : status === "REJECTED" ? "ERROR" : "INFO";
      
      switch (status) {
        case "IN_PROGRESS":
          statusLabel = "sedang diproses oleh petugas";
          break;
        case "APPROVED":
          statusLabel = "telah DISETUJUI";
          break;
        case "REJECTED":
          statusLabel = "ditolak/ditangguhkan";
          break;
      }

      await prisma.notification.create({
        data: {
          title: `Status Pengajuan: ${status}`,
          message: `Pengajuan Anda dengan tiket ${submission.ticketNumber} (${submission.title}) ${statusLabel}. Rincian catatan: ${reviewNotes || "-"}`,
          type: typeLabel,
          category: "DASHBOARD",
          userId: submission.userId,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[SUBMISSION_INDIVIDUAL_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await prisma.taxSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Regular users can only delete their own PENDING submissions
    if (session.user.role === "USER") {
      if (submission.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (submission.status !== "PENDING") {
        return NextResponse.json({ error: "Pengajuan yang sedang diproses tidak dapat dihapus" }, { status: 400 });
      }
    } else if (!["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.taxSubmission.delete({
      where: { id },
    });

    // Write to audit log
    await AuditService.log({
      action: "DELETE",
      table: "TaxSubmission",
      recordId: id,
      userId: session.user.id,
      oldValue: submission,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUBMISSION_INDIVIDUAL_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
