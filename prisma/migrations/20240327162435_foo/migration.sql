/*
  Warnings:

  - You are about to drop the column `additional` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `seats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "seats" DROP COLUMN "additional",
DROP COLUMN "identifier";

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "amenities" TEXT[];

-- CreateTable
CREATE TABLE "SeatSpecAssociation" (
    "seatId" TEXT NOT NULL,
    "specsId" TEXT NOT NULL,

    CONSTRAINT "SeatSpecAssociation_pkey" PRIMARY KEY ("seatId","specsId")
);

-- CreateTable
CREATE TABLE "seat_specs" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "location" TEXT[],
    "features" TEXT[],
    "additional" TEXT,
    "busPresetId" TEXT NOT NULL,

    CONSTRAINT "seat_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_seating_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "bus_seating_presets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SeatSpecAssociation" ADD CONSTRAINT "SeatSpecAssociation_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSpecAssociation" ADD CONSTRAINT "SeatSpecAssociation_specsId_fkey" FOREIGN KEY ("specsId") REFERENCES "seat_specs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_specs" ADD CONSTRAINT "seat_specs_busPresetId_fkey" FOREIGN KEY ("busPresetId") REFERENCES "bus_seating_presets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
