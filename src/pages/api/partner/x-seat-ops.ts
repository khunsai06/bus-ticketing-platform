import { XSeatOperation } from "@/constants";
import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import {
  handleErrorAndRespond,
  isString,
  validateRequestMethod,
} from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const allowedMethods = ["PATCH"];
    validateRequestMethod(req, allowedMethods);
    const { id, ops } = req.query;
    if (!isString(id) || !isString(ops)) {
      throw new ClientErr(400, "Invalid request parameters.");
    }
    const validOps = Object.values(XSeatOperation);
    if (!validOps.includes(ops as XSeatOperation)) {
      throw new ClientErr(400, "Invalid operation provided.");
    }
    if (req.method === "PATCH" && ops === XSeatOperation.lock) {
      await prisma.seat.update({ where: { id }, data: { isAvailable: false } });
    } else if (req.method === "PATCH" && ops === XSeatOperation.open) {
      await prisma.seat.update({ where: { id }, data: { isAvailable: true } });
    }
    return res.status(200).end();
  } catch (error) {
    handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
