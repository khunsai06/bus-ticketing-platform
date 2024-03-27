/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `seats` table. All the data in the column will be lost.
  - Added the required column `phone` to the `consumers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservationId` to the `seats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('FREE', 'LOCKED', 'RESERVED');

-- AlterTable
ALTER TABLE "consumers" ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "seats" DROP COLUMN "isAvailable",
ADD COLUMN     "reservationId" TEXT NOT NULL,
ADD COLUMN     "status" "SeatStatus" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumerId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellations" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumerId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,

    CONSTRAINT "cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservations_seatId_key" ON "reservations"("seatId");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
