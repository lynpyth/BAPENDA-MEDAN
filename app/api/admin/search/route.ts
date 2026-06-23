import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json({ users: [], taxObjects: [], payments: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { nik: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nik: true,
        phone: true,
      },
      take: 10,
    });

    const taxObjects = await prisma.taxObject.findMany({
      where: {
        OR: [
          { nop: { contains: query } },
          { name: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        owner: { select: { name: true, email: true } },
      },
      take: 10,
    });

    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: query, mode: "insensitive" } },
          { taxObject: { nop: { contains: query } } },
        ],
      },
      include: {
        taxObject: { select: { nop: true, name: true } },
        user: { select: { name: true } },
      },
      take: 10,
    });

    return NextResponse.json({ users, taxObjects, payments });
  } catch (error) {
    console.error("[ADMIN_SEARCH_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
