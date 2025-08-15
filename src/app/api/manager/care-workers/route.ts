// /api/manager/care-workers/route.ts
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  subDays,
  startOfDay,
  endOfDay,
  addDays,
  min as dateMin,
  max as dateMax,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

// Format a date in IST or your local TZ
const TZ = "Asia/Kolkata";
function formatLocal(date: Date) {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd");
}
function startOfLocalDay(date: Date) {
  return startOfDay(new Date(formatInTimeZone(date, TZ, "yyyy-MM-dd")));
}

export async function GET() {
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

    // Range: last 7 days including today (local)
    const today = new Date();
    const rangeStart = startOfLocalDay(subDays(today, 6));
    const rangeEnd = endOfDay(today);

    // Get shifts that overlap the range
    const overlappingShifts = await db.shift.findMany({
      where: {
        managerId: manager.id,
        AND: [
          { clockInTime: { lte: rangeEnd } },
          { OR: [{ clockOutTime: null }, { clockOutTime: { gte: rangeStart } }] },
        ],
      },
      include: { careWorker: true },
      orderBy: { clockInTime: "asc" },
    });

    // Shifts that started in range (for people count)
    const startedInRange = overlappingShifts.filter(
      (s) => s.clockInTime >= rangeStart && s.clockInTime <= rangeEnd
    );

    const dayPersonHours: Record<string, Record<number, number>> = {};
    const peopleClockInsByDay: Record<string, Set<number>> = {};
    const totalHoursByStaff: Record<number, number> = {};

    // Build 7-day keys
    const dayKeys: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const keyDate = startOfLocalDay(subDays(today, i));
      dayKeys.push(formatLocal(keyDate));
    }

    const now = new Date();
    // Hours calculation
    for (const shift of overlappingShifts) {
      const start = dateMax([shift.clockInTime, rangeStart]);
      const end = dateMin([shift.clockOutTime ?? now, rangeEnd]);
      if (start >= end) continue;

      let cursor = startOfLocalDay(start);
      while (cursor <= end) {
        const segStart = dateMax([start, cursor]);
        const segEnd = dateMin([endOfDay(cursor), end]);
        const segHours =
          (segEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60);
        if (segHours > 0) {
          const key = formatLocal(cursor);
          if (!dayPersonHours[key]) dayPersonHours[key] = {};
          if (!dayPersonHours[key][shift.careWorkerId])
            dayPersonHours[key][shift.careWorkerId] = 0;
          dayPersonHours[key][shift.careWorkerId] += segHours;

          if (!totalHoursByStaff[shift.careWorkerId])
            totalHoursByStaff[shift.careWorkerId] = 0;
          totalHoursByStaff[shift.careWorkerId] += segHours;
        }
        cursor = addDays(cursor, 1);
      }
    }

    // People count per day (clockIn date in local time)
    for (const shift of startedInRange) {
      const key = formatLocal(startOfLocalDay(shift.clockInTime));
      if (!peopleClockInsByDay[key]) peopleClockInsByDay[key] = new Set();
      peopleClockInsByDay[key].add(shift.careWorkerId);
    }

    // Fill metrics for each day in range
    const avgHoursPerDay = dayKeys.map((d) => {
      const totals = Object.values(dayPersonHours[d] || {});
      const avg = totals.length
        ? totals.reduce((a, b) => a + b, 0) / totals.length
        : 0;
      return { date: d, avgHours: +avg.toFixed(2) };
    });

    const peopleCountPerDay = dayKeys.map((d) => ({
      date: d,
      count: peopleClockInsByDay[d]?.size ?? 0,
    }));

    const totalHoursPerStaff = Object.entries(totalHoursByStaff).map(
      ([staffId, total]) => ({
        staffId: Number(staffId),
        totalHours: +total.toFixed(2),
      })
    );

    // All care workers who ever worked under this manager
    const distinctIds = await db.shift.groupBy({
      by: ["careWorkerId"],
      where: { managerId: manager.id },
    });
    const allIds = distinctIds.map((g) => g.careWorkerId);
    const allCareWorkers = allIds.length
      ? await db.user.findMany({
          where: { id: { in: allIds } },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const careWorkers = allCareWorkers.map((w) => ({
      ...w,
      totalHoursLastWeek: +(totalHoursByStaff[w.id] ?? 0).toFixed(2),
    }));

    return NextResponse.json({
      range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
      careWorkers,
      dashboard: {
        avgHoursPerDay,
        peopleCountPerDay,
        totalHoursPerStaff,
      },
    });
  } catch (err) {
    console.error("Error fetching care workers & dashboard:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
