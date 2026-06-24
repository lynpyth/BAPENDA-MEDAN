import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const totalTaxObjects = await prisma.taxObject.count();
    const totalSppts = await prisma.sppt.count();
    
    // Payments aggregation
    const payments = await prisma.payment.findMany({
      select: {
        amount: true,
        status: true
      }
    });

    let totalRevenue = 0;
    let totalTunggakan = 0;
    let totalPembayaran = 0;

    payments.forEach(p => {
      const amt = Number(p.amount);
      if (p.status === "PAID") {
        totalRevenue += amt;
        totalPembayaran++;
      } else if (p.status === "PENDING" || p.status === "EXPIRED") {
        totalTunggakan += amt;
      }
    });

    // Submissions total
    const totalResearch = await prisma.researchRequest.count();
    const totalPpid = await prisma.pPIDRequest.count();
    const totalComplaints = await prisma.complaint.count();
    const totalTaxSubmissions = await prisma.taxSubmission.count();
    const totalSubmissions = totalResearch + totalPpid + totalComplaints + totalTaxSubmissions;

    // Assessments
    const totalAssessments = await prisma.taxAssessment.count();

    return NextResponse.json({
      totalUsers,
      totalTaxObjects,
      totalSppts,
      totalPembayaran,
      totalRevenue,
      totalTunggakan,
      totalSubmissions,
      totalAssessments
    });
  } catch (error) {
    console.error("[GET_INTEGRATION_DASHBOARD_API]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
