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

export interface ConsumerSignUpPayload {
  name: string;
  dob: string;
  gender: string;
  email: string;
  passwd: string;
}
