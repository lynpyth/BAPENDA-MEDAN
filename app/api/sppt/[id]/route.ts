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

    const sppt = await prisma.sppt.findUnique({
      where: { id },
      include: {
        taxObject: {
          select: {
            id: true,
            nop: true,
            name: true,
            address: true,
            luasTanah: true,
            luasBangun: true,
            njop: true,
            njoptkp: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nik: true,
            address: true,
          },
        },
      },
    });

    if (!sppt) {
      return NextResponse.json({ error: "SPPT not found" }, { status: 404 });
    }

    // Authorization: User can only see their own SPPT
    if (session.user.role === "USER" && sppt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(sppt);
  } catch (error) {
    console.error("[SPPT_INDIVIDUAL_GET_ERROR]", error);
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

    const { isDownloaded, njop, njoptkp, taxObjectVal, taxPeriod } = await req.json();

    const sppt = await prisma.sppt.findUnique({
      where: { id },
    });

    if (!sppt) {
      return NextResponse.json({ error: "SPPT not found" }, { status: 404 });
    }

    // If regular user, they can only update isDownloaded
    if (session.user.role === "USER") {
      if (sppt.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const updated = await prisma.sppt.update({
        where: { id },
        data: { isDownloaded: !!isDownloaded },
      });
      return NextResponse.json(updated);
    }

    // Officer/Admin can update other fields
    if (!["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldData = { ...sppt };
    const updateData: any = {};

    if (isDownloaded !== undefined) updateData.isDownloaded = isDownloaded;
    if (njop !== undefined) updateData.njop = Number(njop);
    if (njoptkp !== undefined) updateData.njoptkp = Number(njoptkp);
    if (taxObjectVal !== undefined) updateData.taxObjectVal = Number(taxObjectVal);
    if (taxPeriod !== undefined) updateData.taxPeriod = taxPeriod;

    const updated = await prisma.sppt.update({
      where: { id },
      data: updateData,
    });

    // Write to audit log
    await AuditService.log({
      action: "UPDATE",
      table: "Sppt",
      recordId: id,
      userId: session.user.id,
      oldValue: oldData,
      newValue: updated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[SPPT_INDIVIDUAL_PATCH_ERROR]", error);
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
    if (!session?.user || !["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sppt = await prisma.sppt.findUnique({
      where: { id },
    });

    if (!sppt) {
      return NextResponse.json({ error: "SPPT not found" }, { status: 404 });
    }

    await prisma.sppt.delete({
      where: { id },
    });

    // Write to audit log
    await AuditService.log({
      action: "DELETE",
      table: "Sppt",
      recordId: id,
      userId: session.user.id,
      oldValue: sppt,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SPPT_INDIVIDUAL_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
