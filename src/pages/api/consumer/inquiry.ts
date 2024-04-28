import { HttpVerb } from "@/constants";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { SignJWT, jwtVerify } from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const paymentResponseToken = req.body.paymentResponse;
    if (!isString(paymentResponseToken)) return res.status(500).end();
    const paymentResponse = JSON.parse(
      Buffer.from(paymentResponseToken, "base64url").toString("utf-8")
    );
    const invoiceNo = paymentResponse.invoiceNo;
    if (!isString(invoiceNo)) return res.status(500).end();

    const url = "https://sandbox-pgw.2c2p.com/payment/4.3/paymentInquiry";
    const inquiryRequestToken = await new SignJWT({
      merchantID: "JT02",
      invoiceNo,
      locale: "en",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(new TextEncoder().encode(process.env.JT02));
    const inquiryResponse = await fetch(url, {
      method: HttpVerb.POST,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: inquiryRequestToken }),
    });

    const inquiryResponseToken = (await inquiryResponse.json()).payload;
    const { payload } = await jwtVerify(
      inquiryResponseToken,
      new TextEncoder().encode(process.env.JT02)
    );

    if (payload.respCode !== "0000") {
      const redirectUrl = `http://localhost:3000/consumer`;
      res.writeHead(302, {
        location: redirectUrl,
      });
      return res.end();
    }

    const ctxQuery = req.query.context;
    if (!isString(ctxQuery))
      throw new Error("Invalid or missing query: [ctxQuery].");

    const ctx = UtilLib.decodeContext(ctxQuery);
    const consumerId = ctx.consumerId as string;
    const seatIdList = ctx.seatIdList as string[];
    const totalAmount = ctx.totalAmount as string;
    const setting = await prisma.settings.findFirstOrThrow({
      orderBy: { createdAt: "desc" },
    });
    await prisma.$transaction(async (tx) => {
      await prisma.seat.updateMany({
        where: { id: { in: seatIdList } },
        data: { status: "BOOKED" },
      });
      await prisma.booking.create({
        data: {
          consumerId,
          totalAmount,
          taxRate: setting.taxRate,
          commissionRate: setting.commissionRate,
          BookedSeat: {
            createMany: {
              data: seatIdList.map((seatId) => ({ seatId })),
            },
          },
        },
      });
    });

    // const redirectUrl = `http://localhost:3000/consumer/booking-details?bookingId=${booking.id}`;
    const redirectUrl = `http://localhost:3000/consumer/history`;
    res.writeHead(302, {
      location: redirectUrl,
    });
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
