import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/services/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const table = searchParams.get("table") || undefined;
    const action = searchParams.get("action") || undefined;
    const recordId = searchParams.get("recordId") || undefined;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const result = await AuditService.getLogs({
      userId,
      table,
      action,
      recordId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API_AUDIT_LOGS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
