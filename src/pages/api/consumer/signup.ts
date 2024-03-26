import { HttpVerb } from "@/constants";
import { AuthLib } from "@/lib/auth";
import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { ConsumerSignUpPayload } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { $Enums, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { object } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const payload = req.body;
    UtilLib.validateRequestMethod(req, [HttpVerb.POST]);
    if (!isExpectedPayload(payload))
      throw new ClientErr(400, "Invalid or missing request body.");
    console.log(req.body);
    const hashedPasswd = await AuthLib.passwdHash(payload.passwd);
    const result = await prisma.credential.create({
      include: { consumer: true },
      data: {
        email: payload.email,
        passwd: hashedPasswd,
        userType: $Enums.UserType.CONSUMER,
        consumer: {
          create: {
            name: payload.name,
            dob: new Date(payload.dob),
            gender: payload.gender,
          },
        },
      },
    });
    console.log({ result });
    res.status(200).json({
      message: "Consumer and corresponding credential successfully created.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message:
          "Sorry, this email is already registered. Please use a different email address.",
      });
    }
    UtilLib.handleErrorAndRespond(error, res);
  }
  res.status(500).json({
    message: "Unexpected issue. Unable to determine the problem.",
  });
}

function isExpectedPayload(payload: any): payload is ConsumerSignUpPayload {
  return (
    typeof payload.name === "string" &&
    typeof payload.dob === "string" &&
    typeof payload.gender === "string" &&
    typeof payload.email === "string" &&
    typeof payload.passwd === "string"
  );
}
