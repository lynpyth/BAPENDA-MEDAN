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

    const zones = await prisma.landValueZone.findMany();
    
    // For each zone, we count the number of tax objects in that district/village
    const zoneStats = await Promise.all(zones.map(async (zone) => {
      const taxObjects = await prisma.taxObject.findMany({
        where: {
          address: {
            contains: zone.district,
            mode: "insensitive"
          }
        },
        select: {
          njop: true
        }
      });

      const count = taxObjects.length;
      const totalNJOP = taxObjects.reduce((acc, curr) => acc + Number(curr.njop || 0), 0);
      const avgNJOP = count > 0 ? Math.round(totalNJOP / count) : 0;

      return {
        ...zone,
        taxObjectCount: count,
        avgNJOP
      };
    }));

    return NextResponse.json({ zones: zoneStats });
  } catch (error) {
    console.error("[GET_ZNT_API]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
