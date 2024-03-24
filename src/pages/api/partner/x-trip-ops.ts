import { HttpVerb, XTripOperation } from "@/constants";
import { ClientErr } from "@/lib/errors";
import { isString } from "@/lib/guards";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const allowedMethods = [HttpVerb.DELETE, HttpVerb.PATCH];
    UtilLib.validateRequestMethod(req, allowedMethods);
    const { id, ops } = req.query;
    if (!isString(id) || !isString(ops)) {
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [id, ops]"
      );
    }
    const validOps = Object.values(XTripOperation);
    if (!validOps.includes(ops as XTripOperation)) {
      throw new ClientErr(400, "Invalid operation provided.");
    }
    if (req.method === HttpVerb.DELETE && ops === XTripOperation.DELETE) {
      await prisma.trip.delete({ where: { id } });
    } else if (req.method === HttpVerb.PATCH && ops === XTripOperation.LAUNCH) {
      await prisma.trip.update({
        where: { id },
        data: { status: $Enums.TripStatus.LAUNCHED },
      });
    } else if (
      req.method === HttpVerb.PATCH &&
      ops === XTripOperation.WITHDRAW
    ) {
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
