-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CONSUMER', 'ADMIN', 'PARTNER');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('IDLE', 'LAUNCHED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "uname" TEXT NOT NULL,
    "passwd" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consumer" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "registrationEmail" TEXT NOT NULL,

    CONSTRAINT "Consumer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationEmail" TEXT NOT NULL,
    "logo" BYTEA,
    "background" TEXT,
    "supportContacts" TEXT[],

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departureLocation" TEXT NOT NULL,
    "arrivalLocation" TEXT NOT NULL,
    "intermediateStops" TEXT,
    "distance" DOUBLE PRECISION,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "additional" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'IDLE',
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "additional" TEXT,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credentials_uname_key" ON "credentials"("uname");

-- CreateIndex
CREATE UNIQUE INDEX "Consumer_cid_key" ON "Consumer"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "Consumer_registrationEmail_key" ON "Consumer"("registrationEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_cid_key" ON "Admin"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "partners_cid_key" ON "partners"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "operators_name_key" ON "operators"("name");

-- CreateIndex
CREATE UNIQUE INDEX "operators_registrationEmail_key" ON "operators"("registrationEmail");

-- AddForeignKey
ALTER TABLE "Consumer" ADD CONSTRAINT "Consumer_cid_fkey" FOREIGN KEY ("cid") REFERENCES "credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_cid_fkey" FOREIGN KEY ("cid") REFERENCES "credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_cid_fkey" FOREIGN KEY ("cid") REFERENCES "credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
