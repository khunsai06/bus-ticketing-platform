import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const as = req.query.as;
    if (!isString(as)) res.status(400).end();
    if (as === "consumer") {
      res.setHeader("Set-Cookie", "consumer-session=; Max-Age=0; Path=/;");
      return res.status(302).redirect("/consumer/login");
    } else if (as === "operator") {
      res.setHeader("Set-Cookie", "operator-session=; Max-Age=0; Path=/;");
      return res.status(302).redirect("/operator/login");
    } else if (as === "admin") {
      res.setHeader("Set-Cookie", "admin-session=; Max-Age=0; Path=/;");
      return res.status(302).redirect("/admin/login");
    } else {
      res.setHeader("Set-Cookie", "consumer-session=; Max-Age=0; Path=/;");
      return res.status(302).redirect("/consumer/login");
    }
  } catch (error) {
    res.status(500).end();
  }
}
