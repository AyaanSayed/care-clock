import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    
    if (!session || session.user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const manager = await db.manager.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    
    const total = await db.shift.count({
      where: {
        managerId: manager.id,
        status: "ACTIVE",
      },
    });

    
    const activeShifts = await db.shift.findMany({
      where: {
        managerId: manager.id,
        status: "ACTIVE",
      },
      include: {
        careWorker: true, 
      },
      orderBy: {
        clockInTime: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      shifts: activeShifts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching active shifts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
