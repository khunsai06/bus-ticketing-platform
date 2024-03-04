import { Role, httpErrorCodes } from "@/constants";
import { passwdCompare, tokenCreate } from "@/lib/auth";
import { ClientErr, HttpErr, ServerErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { delayer } from "@/lib/util";
import { passwdSchema, unameSchema } from "@/lib/zod-schema";
import { Prisma } from "@prisma/client";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== "POST") {
        res.status(405).json({
            message: "Only POST requests are allowed for this endpoint.",
        });
    }
    const { uname, passwd } = req.body;
    try {
        // await delayer(1000)
        const user = await prisma.user.findUniqueOrThrow({ where: { uname } });
        const isPasswdValid = await passwdCompare(passwd, user.passwd);
        const token = await tokenCreate({
            id: user.id,
            role: user.role,
            uname: user.uname,
            email: user.email,
        });
        const cookie = serialize("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3600, // as second 3600s == 1h
            path: "/",
        });
        res.setHeader("Set-Cookie", cookie);
        if (user && isPasswdValid && token && cookie) {
            res.status(200).json({ message: "Hello from Next.js!" });
        }
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            res.status(404).json({
                message:
                    "User not found. Please verify your credentials and try again.",
            });
        } else if (error instanceof ClientErr) {
            // for client
            res.status(error.statusCode).json({ message: error.message });
        } else if (error instanceof ServerErr) {
            // for debugging purpose
            console.error(error.message);
            // Users on the client side shouldn't be exposed to server issues, such as missing secret keys.
            res.status(error.statusCode).json({
                message: httpErrorCodes[error.statusCode],
            });
        } else if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
    res.status(500).json({
        message: "Unexpected issue. Unable to determine the problem.",
    });
}
