import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    const userId = session.user.id;

    // Filter by owner if user is just a taxpayer
    const whereClause: any = {};
    if (role === "USER") {
      whereClause.ownerId = userId;
    }

    const objects = await prisma.taxObject.findMany({
      where: whereClause,
      include: {
        locations: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        owner: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ objects });
  } catch (error) {
    console.error("[GET_OBJECT_TAX_API]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
