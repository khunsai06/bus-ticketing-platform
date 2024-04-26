import { HttpVerb } from "@/constants";
import { ClientErr } from "@/lib/errors";
import { GuardLib } from "@/lib/guard";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    UtilLib.validateRequestMethod(req, [HttpVerb.POST]);
    const contextQuery = req.query.context;
    if (!isString(contextQuery))
      throw new ClientErr(
        400,
        "Invalid or missing request parameter(s): [context]."
      );
    const contextData = UtilLib.decodeContext(contextQuery);
    const ccid = contextData.ccid;
    const seatsIds = contextData.seatsIds;
    if (!isString(ccid) || !GuardLib.isStringArray(seatsIds))
      throw new ClientErr(
        400,
        "Invalid or missing request parameter(s): [context]."
      );
    await prisma.$transaction(async (tx) => {
      const { trip } = await tx.seat.findFirstOrThrow({
        where: { id: seatsIds[0], status: "FREE" },
        select: {
          trip: { select: { operator: { select: { id: true } }, price: true } },
        },
      });
      const unitPrice = trip.price;
      const operatorId = trip.operator.id;
      const amount = unitPrice.times(seatsIds.length);
      const booking = await tx.booking.create({
        data: {
          consumerId: ccid,
          seats: { connect: seatsIds.map((id) => ({ id })) },
        },
      });
      await tx.transaction.create({
        data: {
          bookingId: booking.id,
          amount,
          operatorId,
        },
      });
      return null;
    });
    res.status(200).json({});
  } catch (error) {
    UtilLib.handleErrorAndRespond(error, res);
  }
}
