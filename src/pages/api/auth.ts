import { HttpVerb } from "@/constants";
import { AuthLib } from "@/lib/auth";
import { ClientErr } from "@/lib/errors";
import prismaClient from "@/lib/prisma-client";
import { CredentialPayload } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { $Enums, Prisma } from "@prisma/client";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { isString } from "node:util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const allowedMethods = [HttpVerb.POST];
    UtilLib.validateRequestMethod(req, allowedMethods);
    const userType = req.query.userType;
    if (!isString(userType)) {
      throw new ClientErr(
        400,
        "Invalid or missing query parameter 'userType'."
      );
    }
    const validUserTypes = Object.values($Enums.UserType);
    if (!validUserTypes.includes(req.query.userType as $Enums.UserType)) {
      throw new ClientErr(400, "Invalid userType provided.");
    }
    if (!isExpectedPayload(req.body)) {
      throw new ClientErr(400, "Invalid or missing request body.");
    }
    const payload = req.body as CredentialPayload;
    if (!payload.uname && !payload.email) {
      throw new ClientErr(400, "Please provide either a username or an email.");
    }
    const credentials = await prismaClient.credential.findFirstOrThrow({
      where: {
        OR: [{ uname: payload.uname }, { email: payload.email }],
        userType: userType as $Enums.UserType,
      },
      include: { admin: true, consumer: true, operatorPersonnel: true },
    });
    await AuthLib.passwdCompare(req.body.passwd, credentials.passwd);
    const token = await AuthLib.tokenCreate({
      cid: credentials.id,
      userType: credentials.userType,
      operatorId: credentials.operatorPersonnel?.operatorId,
    });
    const cookie = serialize(`${userType.toLowerCase()}-session`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "Authentication successful. Welcome!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        message:
          "User not found. Please verify your credentials and try again.",
      });
    } else {
      UtilLib.handleErrorAndRespond(error, res);
    }
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}

function isExpectedPayload(body: any): body is CredentialPayload {
  return (
    typeof body.passwd === "string" &&
    (typeof body.uname === "undefined" || typeof body.uname === "string") &&
    (typeof body.email === "undefined" || typeof body.email === "string")
  );
}
