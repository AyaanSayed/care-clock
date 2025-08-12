// src/app/api/shifts/clock-out/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { shiftId, latitude, longitude, note } = await req.json();

    const shift = await db.shift.findUnique({
      where: { id: shiftId },
      include: { manager: true },
    });

    if (!shift || shift.careWorkerId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    if (shift.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Shift is not active" },
        { status: 400 }
      );
    }

    // Distance check
    const distance = calculateDistance(
      latitude,
      longitude,
      shift.manager.latitude,
      shift.manager.longitude
    );

    if (distance > shift.manager.radius) {
      return NextResponse.json(
        { error: "You are outside allowed clock-out range" },
        { status: 400 }
      );
    }

    // Clock-out
    const updatedShift = await db.shift.update({
      where: { id: shift.id },
      data: {
        clockOutTime: new Date(),
        clockOutLat: latitude,
        clockOutLng: longitude,
        clockOutNote: note || null,
        status: "COMPLETED",
      },
    });

    return NextResponse.json(updatedShift);
  } catch (error) {
    console.error("Clock-out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
