import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objects = await prisma.taxObject.findMany({
      include: {
        owner: {
          select: { name: true, email: true }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            taxPeriod: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(objects);
  } catch (error) {
    console.error("[ADMIN_TAX_OBJECTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
