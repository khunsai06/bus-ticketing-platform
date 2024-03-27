import { HttpVerb } from "@/constants";
import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { TripEntryPayload } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "node:util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(req.body);

    if (req.query.id) {
      UtilLib.validateRequestMethod(req, [HttpVerb.PUT]);
      processTripUpdateRequest(req);
      res.status(200).json({ message: "Trip and seats successfully updated" });
    } else {
      UtilLib.validateRequestMethod(req, [HttpVerb.POST]);
      processTripCreateRequest(req);
      res.status(200).json({ message: "Trip and seats successfully created" });
    }
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}

function isExpectedPayload(body: any): body is TripEntryPayload {
  return (
    typeof body.name === "string" &&
    typeof body.departureLocation === "string" &&
    typeof body.arrivalLocation === "string" &&
    typeof body.intermediateStops === "string" &&
    typeof body.departureTime === "string" &&
    typeof body.arrivalTime === "string" &&
    typeof body.distance === "number" &&
    typeof body.price === "number" &&
    typeof body.amenities === "string" &&
    typeof body.additional === "string"
  );
}

async function processTripCreateRequest(req: NextApiRequest) {
  const payload = req.body;
  const operatorId = req.query.operatorId;
  if (!isExpectedPayload(payload)) {
    throw new ClientErr(400, "Invalid or missing request body.");
  }
  if (!isString(operatorId)) {
    throw new ClientErr(
      400,
      "Invalid or missing request query parameter(s): [operatorId]."
    );
  }
  const { departureTime, arrivalTime, intermediateStops, amenities, ...args } =
    payload;
  const data = {
    departureTime: new Date(departureTime),
    arrivalTime: new Date(arrivalTime),
    intermediateStops: UtilLib.commaSeparatedStringToArray(intermediateStops),
    amenities: UtilLib.commaSeparatedStringToArray(amenities),
    ...args,
    operatorId,
  };
  return prisma.trip.create({ data });
}

async function processTripUpdateRequest(req: NextApiRequest) {
  const payload = req.body;
  const id = req.query.id;
  if (!isExpectedPayload(payload)) {
    throw new ClientErr(400, "Invalid or missing request body.");
  }
  if (!isString(id)) {
    throw new ClientErr(
      400,
      "Invalid or missing request query parameter(s): [id]."
    );
  }
  const { departureTime, arrivalTime, intermediateStops, amenities, ...args } =
    payload;
  const data = {
    departureTime: new Date(departureTime),
    arrivalTime: new Date(arrivalTime),
    intermediateStops: UtilLib.commaSeparatedStringToArray(intermediateStops),
    amenities: UtilLib.commaSeparatedStringToArray(amenities),
    ...args,
  };
  return prisma.trip.update({ where: { id }, data });
}

// async function generateSeats(tripId: string, seatCapacity: number) {
//   const seatList = Array.from({ length: seatCapacity }, (_, index) => {
//     return { identifier: String(index + 1), tripId };
//   });
//   await prisma.seat.createMany({
//     data: seatList,
//   });
// }
