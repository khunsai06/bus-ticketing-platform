import prisma from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const bookingId = req.query.bookingId;
    if (!isString(bookingId)) return res.status(400).end();
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        isCanceled: true,
      },
    });
    await prisma.seat.updateMany({
      where: { BookedSeat: { some: { bookingId } } },
      data: { status: "FREE" },
    });
    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
}
