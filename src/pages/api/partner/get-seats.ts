import { ClientErr } from "@/lib/errors";
import { isString } from "@/lib/guards";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const tripId = req.query.tripId;
    if (!isString(tripId))
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [tripId]."
      );
    const trips = await prisma.seat.findMany({
      where: { tripId },
      orderBy: { id: "asc" },
    });
    res.status(200).json(trips);
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
