import { HttpVerb, XSeatOperation } from "@/constants";
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
    const allowedMethods = [HttpVerb.PATCH];
    UtilLib.validateRequestMethod(req, allowedMethods);
    const { id, ops } = req.query;
    if (!isString(id) || !isString(ops)) {
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [id, ops]"
      );
    }
    const validOps = Object.values(XSeatOperation);
    if (!validOps.includes(ops as XSeatOperation)) {
      throw new ClientErr(400, "Invalid operation provided.");
    }
    if (req.method === HttpVerb.PATCH && ops === XSeatOperation.LOCK) {
      await prisma.seat.update({ where: { id }, data: { isAvailable: false } });
    } else if (req.method === HttpVerb.PATCH && ops === XSeatOperation.OPEN) {
      await prisma.seat.update({ where: { id }, data: { isAvailable: true } });
    }
    res
      .status(200)
      .json({ message: `Seat ${ops.toLowerCase()} operation success.` });
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
