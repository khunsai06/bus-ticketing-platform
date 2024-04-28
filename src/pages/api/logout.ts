import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const as = req.query.as;
    if (!isString(as)) res.status(400).end();
    res.setHeader("Set-Cookie", "consumer-session=; Max-Age=0; Path=/;");
    res.status(302).redirect("/consumer/login");
  } catch (error) {
    res.status(500).end();
  }
}
