import { Prisma } from "@prisma/client";
import prisma from "./prisma-client";

type PrismaReturnTrip = Prisma.PromiseReturnType<typeof prisma.trip.findFirstOrThrow>;
export type Trip = Omit<PrismaReturnTrip, "departureTime" | "arrivalTime" | "price"> & {
  departureTime: string;
  arrivalTime: string;
  price: number;
};
export type Trips = Trip[];

export type Seat = Prisma.PromiseReturnType<typeof prisma.seat.findUniqueOrThrow>;
