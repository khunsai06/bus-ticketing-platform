import { HttpVerb, XSeatOps } from "@/constants";
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
    UtilLib.validateRequestMethod(req, [HttpVerb.PATCH, HttpVerb.DELETE]);
    const id = req.query.id;
    const ops = req.query.ops;
    if (!isString(id) || !isString(ops))
      throw new ClientErr(
        400,
        "Invalid or missing request query parameter(s): [id, ops]"
      );
    const validOps = Object.values(XSeatOps);
    if (!validOps.includes(ops as XSeatOps))
      throw new ClientErr(400, "Invalid operation provided.");
    if (req.method === HttpVerb.DELETE && ops === XSeatOps.DELETE) {
      await prisma.seat.delete({ where: { id } });
    } else if (req.method === HttpVerb.PATCH && ops === XSeatOps.LOCK) {
      await prisma.seat.update({
        where: { id },
        data: { status: $Enums.SeatStatus.LOCKED },
      });
    } else if (req.method === HttpVerb.PATCH && ops === XSeatOps.FREE) {
      await prisma.seat.update({
        where: { id },
        data: { status: $Enums.SeatStatus.FREE },
      });
    }
    res
      .status(200)
      .json({ message: `Seat ${ops.toLowerCase()} operation success.` });
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
}
