import { type Seat, Trip, Operator } from "@prisma/client";

export type Trip2 = Omit<Trip, "departureTime" | "arrivalTime" | "price"> & {
  departureTime: string;
  arrivalTime: string;
  price: number;
};

export type Trip3 = Trip2 & {
  operator: Operator;
};

export type Seat2 = Seat;

export type CredentialPayload = {
  uname?: string;
  email?: string;
  passwd: string;
};

export interface TripEntryPayload {
  name: string;
  departureLocation: string;
  arrivalLocation: string;
  intermediateStops: string;
  departureTime: string;
  arrivalTime: string;
  distance: number;
  price: number;
  amenities: string;
  additional: string;
}

export interface ConsumerSignUpPayload {
  name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  passwd: string;
}
