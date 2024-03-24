import { Prisma } from "@prisma/client";
import prisma from "./prisma-client";

type PrismaReturnTrip = Prisma.PromiseReturnType<
  typeof prisma.trip.findFirstOrThrow
>;
export type Trip = Omit<
  PrismaReturnTrip,
  "departureTime" | "arrivalTime" | "price"
> & {
  departureTime: string;
  arrivalTime: string;
  price: number;
};

export type Seat = Prisma.PromiseReturnType<
  typeof prisma.seat.findUniqueOrThrow
>;

export type CredentialPayload = {
  uname?: string;
  email?: string;
  passwd: string;
};

export type TripEntryPayload = {
  title: string;
  departureLocation: string;
  arrivalLocation: string;
  intermediateStops?: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  additional?: string;
  seatCapacity: number;
  operatorId: string;
};
