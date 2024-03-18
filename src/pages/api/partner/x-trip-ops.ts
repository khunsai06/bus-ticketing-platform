import { XTripOperation } from "@/constants";
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
    const allowedMethods = ["PATCH", "DELETE"];
    validateRequestMethod(req, allowedMethods);
    const { id, ops } = req.query;
    if (!isString(id) || !isString(ops)) {
      throw new ClientErr(400, "Invalid request parameters.");
    }
    const validOps = Object.values(XTripOperation);
    if (!validOps.includes(ops as XTripOperation)) {
      throw new ClientErr(400, "Invalid operation provided.");
    }
    if (req.method === "DELETE" && ops === XTripOperation.delete) {
      await prisma.trip.delete({ where: { id } });
    } else if (req.method === "PATCH" && ops === XTripOperation.launch) {
      await prisma.trip.update({ where: { id }, data: { status: "LAUNCHED" } });
    } else if (req.method === "PATCH" && ops === XTripOperation.withdraw) {
      await prisma.trip.update({
        where: { id },
        data: { status: "WITHDRAWN" },
      });
    }
    return res.status(200).end();
  } catch (error) {
    handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}
