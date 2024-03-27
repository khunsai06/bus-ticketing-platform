-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CONSUMER', 'ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('IDLE', 'LAUNCHED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "uname" TEXT,
    "email" TEXT,
    "passwd" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "gender" TEXT NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "consumers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_personnel" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "operator_personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationEmail" TEXT NOT NULL,
    "logo" TEXT,
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
    "price" MONEY NOT NULL,
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
CREATE UNIQUE INDEX "credentials_email_key" ON "credentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "consumers_cid_key" ON "consumers"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_cid_key" ON "admins"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "operator_personnel_cid_key" ON "operator_personnel"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "operators_name_key" ON "operators"("name");

-- CreateIndex
CREATE UNIQUE INDEX "operators_registrationEmail_key" ON "operators"("registrationEmail");

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_cid_fkey" FOREIGN KEY ("cid") REFERENCES "credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_cid_fkey" FOREIGN KEY ("cid") REFERENCES "credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_personnel" ADD CONSTRAINT "operator_personnel_cid_fkey" FOREIGN KEY ("cid") REFERENCES "credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_personnel" ADD CONSTRAINT "operator_personnel_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
