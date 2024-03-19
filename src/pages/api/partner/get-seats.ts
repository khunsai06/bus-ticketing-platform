import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { handleErrorAndRespond, isString } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { tripId } = req.query;
    if (!isString(tripId)) {
      throw new ClientErr(400, "Invalid request parameters.");
    }
    const trips = await prisma.seat.findMany({
      where: { tripId },
      orderBy: { id: "asc" },
    });
    console.log(trips);

    res.status(200).json(trips);
  } catch (error) {
    handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
