// /api/shifts/history/route.ts
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "care_worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let whereClause: any = { careWorkerId: parseInt(session.user.id) };

    if (startDate) {
      whereClause.clockInTime = {
        ...(whereClause.clockInTime || {}),
        gte: startOfDay(new Date(startDate)),
      };
    }

    if (endDate) {
      whereClause.clockInTime = {
        ...(whereClause.clockInTime || {}),
        lte: endOfDay(new Date(endDate)),
      };
    }

    // Count total records for pagination
    const totalCount = await db.shift.count({ where: whereClause });

    // Fetch paginated records
    const shifts = await db.shift.findMany({
      where: whereClause,
      include: {
        manager: { include: { user: true } },
      },
      orderBy: { clockInTime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: shifts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Shift history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
