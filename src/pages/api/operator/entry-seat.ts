import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = req.body;
  const tripId = req.query.tripId;
  try {
    if (!isSeatEntryPayload(payload))
      throw new ClientErr(400, "Invalid or missing request body.");
    if (!isString(tripId))
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [tripId]."
      );

    const result = await prisma.seat.create({
      data: {
        number: payload.number,
        location: UtilLib.toArray2(payload.location),
        features: UtilLib.toArray2(payload.features),
        additional: payload.additional,
        tripId,
      },
    });
    return res.status(200).json(result);
  } catch (error) {
    return UtilLib.handleErrorAndRespond(error, res);
  }
}

type SeatEntryPayload = {
  number: string;
  location: string;
  features: string;
  additional: string;
};

function isSeatEntryPayload(payload: any): payload is SeatEntryPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.number === "string" &&
    typeof payload.location === "string" &&
    typeof payload.features === "string" &&
    typeof payload.additional === "string"
  );
}
