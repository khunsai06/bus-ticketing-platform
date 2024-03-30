import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "node:util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const id = req.query.id;
    if (!isString(id))
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [id]."
      );
    const result = await prisma.trip.findUniqueOrThrow({
      where: { id },
      include: { seats: { orderBy: { id: "desc" } } },
    });
    res.status(200).json(result);
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
