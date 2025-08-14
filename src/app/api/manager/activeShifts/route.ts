// /app/api/manager/activeShifts/route.ts

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Must be logged in and a manager
    if (!session || session.user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get manager's record to find their ID
    const manager = await db.manager.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Count total active shifts
    const total = await db.shift.count({
      where: {
        managerId: manager.id,
        status: "ACTIVE",
      },
    });

    // Fetch paginated active shifts
    const activeShifts = await db.shift.findMany({
      where: {
        managerId: manager.id,
        status: "ACTIVE",
      },
      include: {
        careWorker: true, // Include care worker's user details
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
