import { CONSUMER_SESSION_COOKIE_NAME, HttpVerb } from "@/constants";
import { AuthLib } from "@/lib/auth";
import { GuardLib } from "@/lib/guard";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { getCookie } from "cookies-next";
import { SignJWT, jwtVerify } from "jose";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ctxQuery = req.query.context;
  if (!isString(ctxQuery)) return res.status(400).end();
  const seatIdList = UtilLib.decodeContext(ctxQuery);
  if (!GuardLib.isStringArray(seatIdList)) return res.status(400).end();
  try {
    const {
      Trip: { price },
    } = await prisma.seat.findFirstOrThrow({
      where: { id: { in: seatIdList } },
      select: {
        Trip: { select: { price: true } },
      },
    });
    const amountDue = seatIdList.length * price.toNumber();
    const url = "https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken";
    const consumerId = getCookie("consumerId", { req });
    const context = UtilLib.encodeContext({
      consumerId,
      seatIdList,
      totalAmount: amountDue,
    });
    const frontendReturnUrl = `http://localhost:3000/api/consumer/inquiry?context=${context}`;
    if (!isString(consumerId)) return res.status(500).end();
    const paymentRequestToken = await new SignJWT({
      merchantID: "JT02",
      invoiceNo: moment().unix(),
      description: "Hello World",
      amount: amountDue,
      currencyCode: "MMK",
      frontendReturnUrl,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(new TextEncoder().encode(process.env.JT02));

    const paymentResponse = await fetch(url, {
      method: HttpVerb.POST,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: paymentRequestToken }),
    });
    const paymentResponseToken = (await paymentResponse.json()).payload;
    const { payload } = await jwtVerify(
      paymentResponseToken,
      new TextEncoder().encode(process.env.JT02)
    );
    const webPaymentUrl = payload.webPaymentUrl;
    res.status(200).json({ webPaymentUrl });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
