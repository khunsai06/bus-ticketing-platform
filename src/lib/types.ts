import { type Seat, Trip } from "@prisma/client";

export type Trip2 = Omit<Trip, "departureTime" | "arrivalTime" | "price"> & {
  departureTime: string;
  arrivalTime: string;
  price: number;
};

export type Seat2 = Seat;

export type CredentialPayload = {
  uname?: string;
  email?: string;
  passwd: string;
};

export interface TripEntryPayload {
  title: string;
  departureLocation: string;
  arrivalLocation: string;
  intermediateStops: string;
  departureTime: string;
  arrivalTime: string;
  distance: number;
  price: number;
  additional: string;
}
