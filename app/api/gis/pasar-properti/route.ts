import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await prisma.propertyMarket.findMany();

    // Average price and comparisons
    const avgMarketPrice = properties.length > 0
      ? properties.reduce((acc, curr) => acc + Number(curr.marketPrice), 0) / properties.length
      : 0;

    // Let's get the average NJOP of PBB-P2 objects for comparison
    const pbbObjects = await prisma.taxObject.findMany({
      where: {
        type: "PBB-P2"
      },
      select: {
        njop: true
      }
    });

    const avgNJOP = pbbObjects.length > 0
      ? pbbObjects.reduce((acc, curr) => acc + Number(curr.njop || 0), 0) / pbbObjects.length
      : 0;

    const pctDiff = avgNJOP > 0 ? ((avgMarketPrice - avgNJOP) / avgNJOP) * 100 : 0;

    return NextResponse.json({
      properties,
      statistics: {
        avgMarketPrice,
        avgNJOP,
        pctDiff
      }
    });
  } catch (error) {
    console.error("[GET_PROPERTY_MARKET_API]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
