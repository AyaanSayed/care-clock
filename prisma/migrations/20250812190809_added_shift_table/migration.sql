-- CreateEnum
CREATE TYPE "public"."ShiftStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Shift" (
    "id" SERIAL NOT NULL,
    "careWorkerId" INTEGER NOT NULL,
    "managerId" INTEGER NOT NULL,
    "organization" TEXT NOT NULL,
    "clockInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clockInLat" DOUBLE PRECISION,
    "clockInLng" DOUBLE PRECISION,
    "clockInNote" TEXT,
    "clockOutTime" TIMESTAMP(3),
    "clockOutLat" DOUBLE PRECISION,
    "clockOutLng" DOUBLE PRECISION,
    "clockOutNote" TEXT,
    "status" "public"."ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_careWorkerId_fkey" FOREIGN KEY ("careWorkerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;
