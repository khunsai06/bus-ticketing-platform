import prisma from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ops = req.query.ops;
  const value = req.query.value;
  const oldSettings = {};
  try {
    if (!isString(ops) || !isString(value)) return res.status(400).end();
    const old = await prisma.settings.findFirstOrThrow({
      orderBy: { createdAt: "desc" },
    });
    console.log({ ops, value });
    if (ops === "comm") {
      await prisma.settings.create({
        data: {
          taxRate: old.taxRate,
          commissionRate: parseFloat(value),
          refundTimeFrame: old.refundTimeFrame,
          tocFile: old.tocFile,
          policyFile: old.policyFile,
        },
      });
    } else if (ops === "tax") {
      await prisma.settings.create({
        data: {
          taxRate: parseFloat(value),
          commissionRate: old.commissionRate,
          refundTimeFrame: old.refundTimeFrame,
          tocFile: old.tocFile,
          policyFile: old.policyFile,
        },
      });
    } else if (ops == "refundTime") {
      await prisma.settings.create({
        data: {
          taxRate: old.taxRate,
          commissionRate: old.commissionRate,
          refundTimeFrame: parseInt(value),
          tocFile: old.tocFile,
          policyFile: old.policyFile,
        },
      });
    } else {
      return res.status(500).end();
    }
    return res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
