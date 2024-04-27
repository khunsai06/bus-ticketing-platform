import { HttpVerb, XTripOps } from "@/constants";
import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "node:util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const allowedMethods = [HttpVerb.DELETE, HttpVerb.PATCH];
    UtilLib.validateRequestMethod(req, allowedMethods);
    const { id, ops } = req.query;
    if (!isString(id) || !isString(ops))
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [id, ops]"
      );

    const validOps = Object.values(XTripOps);
    if (!validOps.includes(ops as XTripOps))
      throw new ClientErr(400, "Invalid operation provided.");

    if (req.method === HttpVerb.DELETE && ops === XTripOps.DELETE) {
      await prisma.trip.delete({ where: { id } });
    } else if (req.method === HttpVerb.PATCH && ops === XTripOps.LAUNCH) {
      const result = await prisma.trip.update({
        where: { id },
        data: { status: $Enums.TripStatus.LAUNCHED },
        include: { Seats: true },
      });
      return res.status(200).json(result);
    } else if (req.method === HttpVerb.PATCH && ops === XTripOps.WITHDRAW) {
      await prisma.trip.update({
        where: { id },
        data: { status: $Enums.TripStatus.WITHDRAWN },
      });
    }
    res
      .status(200)
      .json({ message: `Trip ${ops.toLowerCase()} operation success.` });
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
