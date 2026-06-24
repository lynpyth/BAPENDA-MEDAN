import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/services/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || "";

    let whereClause: any = {};

    // Filter by role
    if (session.user.role === "USER" || session.user.role === "MAHASISWA") {
      whereClause.userId = session.user.id;
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const submissions = await prisma.taxSubmission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nik: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("[SUBMISSIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, title, description, documentUrl } = await req.json();

    if (!type || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["KEBERATAN", "PERUBAHAN"].includes(type)) {
      return NextResponse.json({ error: "Tipe pengajuan tidak valid" }, { status: 400 });
    }

    // Generate unique ticket number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `SUB-${dateStr}-${rand}`;

    const submission = await prisma.taxSubmission.create({
      data: {
        ticketNumber,
        type,
        title,
        description,
        documentUrl,
        userId: session.user.id,
      },
    });

    // Write to audit log
    await AuditService.log({
      action: "CREATE",
      table: "TaxSubmission",
      recordId: submission.id,
      userId: session.user.id,
      newValue: {
        ticketNumber,
        type,
        title,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSIONS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
