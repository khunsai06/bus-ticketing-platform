import { HttpVerb } from "@/constants";
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
    const userDefined1 = payload.userDefined1;
    const ctx = UtilLib.decodeContext(userDefined1);
    // const redirectUrl = `/consumer/invoice?context=${ctx}`;
    res.status(200).json({ msg: "Hello World" });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}
