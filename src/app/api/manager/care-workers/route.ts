// /api/manager/care-workers/route.ts
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get manager record (to get the ID)
    const manager = await db.manager.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    // Get unique care workers from shifts
    const shifts = await db.shift.findMany({
      where: { managerId: manager.id },
      include: {
        careWorker: true, // This is the User model
      },
    });

    // Filter unique care workers
    const uniqueCareWorkers = Array.from(
      new Map(shifts.map((s) => [s.careWorker.id, s.careWorker])).values()
    );

    return NextResponse.json(uniqueCareWorkers);
  } catch (error) {
    console.error("Error fetching care workers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
