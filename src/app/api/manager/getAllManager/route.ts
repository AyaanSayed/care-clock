import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";


export async function GET(req : Request) {
  const session = await getServerSession(authOptions);
  if(!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const managers = await db.user.findMany({
    where: {
      role: Role.manager
    },
    include: {
      manager: true 
    }
  });

  return NextResponse.json(managers);

}