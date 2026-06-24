import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = await prisma.taxObject.count({ where: { status: "VERIFIED" } });
    const pending = await prisma.taxObject.count({ where: { status: "PENDING" } });
    const rejected = await prisma.taxObject.count({ where: { status: "REJECTED" } });
    
    // Created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newAdded = await prisma.taxObject.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Recent activity trackers (audit logs of surveyor changes)
    const logs = await prisma.auditLog.findMany({
      where: {
        action: "FIELD_SURVEY_UPDATE"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      verified,
      pending,
      rejected,
      newAdded,
      recentActivity: logs.map(l => ({
        id: l.id,
        officer: l.user.name,
        action: l.action,
        timestamp: l.createdAt.toISOString(),
        details: l.newValue
      }))
    });
  } catch (error) {
    console.error("[GET_SURVEY_STATS_API]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
