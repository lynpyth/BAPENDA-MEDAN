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
    const taxPeriod = searchParams.get("taxPeriod") || undefined;
    const search = searchParams.get("search") || "";

    let whereClause: any = {};

    // Filter by role
    if (session.user.role === "USER" || session.user.role === "MAHASISWA") {
      whereClause.userId = session.user.id;
    }

    // Additional filters
    if (taxPeriod) {
      whereClause.taxPeriod = taxPeriod;
    }

    if (search) {
      whereClause.OR = [
        { spptNumber: { contains: search, mode: "insensitive" } },
        { taxObject: { nop: { contains: search, mode: "insensitive" } } },
        { taxObject: { name: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const sppts = await prisma.sppt.findMany({
      where: whereClause,
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
      orderBy: [
        { taxPeriod: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(sppts);
  } catch (error) {
    console.error("[SPPT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { taxObjectId, taxPeriod, njop, njoptkp, taxObjectVal } = await req.json();

    if (!taxObjectId || !taxPeriod || !njop || !taxObjectVal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get Tax Object to verify and retrieve owner
    const taxObject = await prisma.taxObject.findUnique({
      where: { id: taxObjectId },
      include: { owner: true },
    });

    if (!taxObject) {
      return NextResponse.json({ error: "Tax Object not found" }, { status: 404 });
    }

    // Check if SPPT already exists for this tax object in this tax period
    const existing = await prisma.sppt.findFirst({
      where: {
        taxObjectId,
        taxPeriod,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "SPPT untuk periode tahun pajak ini sudah terbit" }, { status: 400 });
    }

    // Generate unique SPPT number
    const rand = Math.floor(1000 + Math.random() * 9000);
    const spptNumber = `SPPT-${taxPeriod}-${taxObject.nop}-${rand}`;

    const sppt = await prisma.sppt.create({
      data: {
        spptNumber,
        taxPeriod,
        njop: Number(njop),
        njoptkp: Number(njoptkp || 0),
        taxObjectVal: Number(taxObjectVal),
        taxObjectId,
        userId: taxObject.ownerId,
      },
      include: {
        taxObject: true,
        user: true,
      },
    });

    // Write to audit log
    await AuditService.log({
      action: "CREATE",
      table: "Sppt",
      recordId: sppt.id,
      userId: session.user.id,
      newValue: {
        spptNumber,
        taxPeriod,
        taxObjectId,
        taxObjectVal,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        title: "SPPT PBB Baru Terbit",
        message: `SPPT PBB Tahun Pajak ${taxPeriod} untuk NOP ${taxObject.nop} telah diterbitkan. Silakan periksa di dashboard Anda.`,
        type: "SUCCESS",
        category: "DASHBOARD",
        userId: taxObject.ownerId,
      },
    });

    return NextResponse.json(sppt);
  } catch (error) {
    console.error("[SPPT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
