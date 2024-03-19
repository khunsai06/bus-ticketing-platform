import { httpErrorCodes } from "@/constants";
import prisma from "@/lib/prisma-client";
import { handleErrorAndRespond } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const trips = await prisma.trip.findMany({ orderBy: { id: "desc" } });
    res.status(200).json(trips);
  } catch (error) {
    handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
