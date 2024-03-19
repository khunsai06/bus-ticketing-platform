import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { handleErrorAndRespond, isString, validateRequestMethod } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.query.id) {
      processTripUpdateRequest(req);
      res.status(200).json({ message: "Trip and seats successfully updated" });
    } else {
      processTripCreateRequest(req);
      res.status(200).json({ message: "Trip and seats successfully created" });
    }
  } catch (error) {
    handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}

interface Payload {
  title: string;
  departureLocation: string;
  arrivalLocation: string;
  intermediateStops: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  additional: string;
  seatCapacity: number;
  operatorId: string;
}

function isExpectedPayload(body: any): body is Payload {
  if (
    typeof body.title !== "string" ||
    typeof body.departureLocation !== "string" ||
    typeof body.arrivalLocation !== "string" ||
    typeof body.intermediateStops !== "string" ||
    typeof body.departureTime !== "string" ||
    typeof body.arrivalTime !== "string" ||
    typeof body.price !== "number" ||
    typeof body.additional !== "string" ||
    typeof body.seatCapacity !== "number" ||
    typeof body.operatorId !== "string"
  ) {
    return false;
  }
  return true;
}

async function processTripCreateRequest(req: NextApiRequest) {
  const allowedMethods = ["POST"];
  validateRequestMethod(req, allowedMethods);
  if (!isExpectedPayload(req.body)) {
    throw new ClientErr(400, "Invalid or missing request body");
  }
  const tripId = await createTrip(req.body);
  await generateSeats(tripId, req.body.seatCapacity);
}

async function processTripUpdateRequest(req: NextApiRequest) {
  const allowedMethods = ["PUT"];
  validateRequestMethod(req, allowedMethods);
  const { id } = req.query;
  if (!isString(id)) {
    throw new ClientErr(400, "Invalid or missing query parameter 'id'.");
  }
  if (!isExpectedPayload(req.body)) {
    throw new ClientErr(400, "Invalid or missing request body.");
  }
  const tripId = await updateTrip(id, req.body);
  await prisma.seat.deleteMany({ where: { tripId } });
  await generateSeats(tripId, req.body.seatCapacity);
}

async function createTrip(payload: Payload) {
  const { departureTime, arrivalTime, seatCapacity, ...others } = payload;
  const trip = await prisma.trip.create({
    data: {
      ...others,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
    },
  });
  return trip.id;
}

async function updateTrip(id: string, payload: Payload) {
  const { departureTime, arrivalTime, seatCapacity, ...others } = payload;
  const trip = await prisma.trip.update({
    where: { id },
    data: {
      ...others,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
    },
  });
  return trip.id;
}

async function generateSeats(tripId: string, seatCapacity: number) {
  const seatList = Array.from({ length: seatCapacity }, (_, index) => {
    return { identifier: String(index + 1), tripId };
  });
  await prisma.seat.createMany({
    data: seatList,
  });
}
