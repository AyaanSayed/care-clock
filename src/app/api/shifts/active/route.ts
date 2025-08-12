import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "care_worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeShift = await db.shift.findFirst({
      where: {
        careWorkerId: parseInt(session.user.id),
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

    if (!activeShift) {
      return NextResponse.json(null); // No active shift
    }

    return NextResponse.json(activeShift);
  } catch (error) {
    console.error("Error fetching active shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
