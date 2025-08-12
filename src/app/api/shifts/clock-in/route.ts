import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "care_worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { managerId, latitude, longitude, note } = await req.json();

    if (!managerId || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already has an active shift
    const activeShift = await db.shift.findFirst({
      where: {
        careWorkerId: parseInt(session.user.id),
        status: "ACTIVE",
      },
    });

    if (activeShift) {
      return NextResponse.json(
        { error: "You already have an active shift. Please clock out first." },
        { status: 409 }
      );
    }

    // Get manager details
    const manager = await db.manager.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    // Check distance against manager's perimeter
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      manager.latitude,
      manager.longitude
    );

    if (distance > manager.radius) {
      return NextResponse.json(
        { error: `You are outside the allowed perimeter (${manager.radius} km)` },
        { status: 403 }
      );
    }

    // Create shift
    const shift = await db.shift.create({
      data: {
        careWorkerId: parseInt(session.user.id),
        managerId: manager.id,
        organization: manager.organization,
        clockInLat: latitude,
        clockInLng: longitude,
        clockInNote: note || null,
        status: "ACTIVE",
      },
      include: {
        manager: {
          include: {
            user: true, 
          },
        },
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error("Clock-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper functions
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
