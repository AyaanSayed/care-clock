import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get Manager.id from the logged-in user's User.id
    const managerRecord = await db.manager.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!managerRecord) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const careWorkerId = searchParams.get("careWorkerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!careWorkerId) {
      return NextResponse.json(
        { error: "careWorkerId is required" },
        { status: 400 }
      );
    }

    let whereClause: any = {
      careWorkerId: parseInt(careWorkerId),
      managerId: managerRecord.id, // ✅ Use Manager.id, not User.id
    };

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

    const total = await db.shift.count({ where: whereClause });

    const shifts = await db.shift.findMany({
      where: whereClause,
      include: {
        manager: { include: { user: true } },
        careWorker: true,
      },
      orderBy: { clockInTime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      shifts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Manager shift fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
