import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  if (!session || session.user.role !== "manager") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  if (session.user.role === "manager") {
    try {
      const existingManager = await db.manager.findUnique({
        where: {
          userId: parseInt(session.user.id),
        },
      });

      if (existingManager) {
        return NextResponse.json("Manager already exists", { status: 409 });
      }

      const newManager = await db.manager.create({
        data: {
          userId: parseInt(session.user.id),
          organization: body.organization,
          latitude: body.latitude,
          longitude: body.longitude,
        },
      });
      return NextResponse.json(newManager, { status: 201 });
    } catch (error) {
      console.error(error);
      return NextResponse.json("Internal Server Error", { status: 500 });
    }
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "manager") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const manager = await db.manager.findUnique({
      where: {
        userId: parseInt(session.user.id),
      },
    });

    if (!manager) {
      return NextResponse.json("Manager not found", { status: 404 });
    }

    return NextResponse.json(manager, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  if (!session || session.user.role !== "manager") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const manager = await db.manager.findUnique({
      where: {
        userId: parseInt(session.user.id),
      },
    });

    if (!manager) {
      return NextResponse.json("Manager not found", { status: 404 });
    }

    const updatedManager = await db.manager.update({
      where: {
        userId: parseInt(session.user.id),
      },
      data: {
        organization: body.organization,
        latitude: body.latitude,
        longitude: body.longitude,
      },
    });

    return NextResponse.json(updatedManager, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "manager") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const manager = await db.manager.findUnique({
      where: {
        userId: parseInt(session.user.id),
      },
    });

    if (!manager) {
      return NextResponse.json("Manager not found", { status: 404 });
    }

    await db.manager.delete({
      where: {
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json("Manager deleted successfully", { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
