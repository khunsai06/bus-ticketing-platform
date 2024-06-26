import { SignJWT, jwtVerify, decodeJwt, type JWTPayload } from "jose";
import { ClientErr, ServerErr } from "./errors";
import bcrypt from "bcryptjs";
import { $Enums } from "@prisma/client";

type JWTPayload2 = {
  cid: string;
  userType: $Enums.UserType;
  operatorId?: string;
  consumerId?: string;
} & JWTPayload;

export namespace AuthLib {
  export async function passwdHash(passwd: string): Promise<string> {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(passwd, saltRounds);
    } catch (error) {
      console.error("An error occurred while hashing the password:", error);
      throw error;
    }
  }

  export async function passwdCompare(
    passwd: string,
    hash: string
  ): Promise<boolean> {
    try {
      const result = await bcrypt.compare(passwd, hash);
      if (result === false) {
        throw new ClientErr(
          401,
          "Invalid password. Please double-check and try again."
        );
      }
      return result;
    } catch (error) {
      console.error("An error occurred while comparing the passwords:", error);
      throw error;
    }
  }
  export async function tokenCreate(payload: JWTPayload2): Promise<string> {
    const jti = crypto.randomUUID();
    if (!process.env.SECRET) {
      throw new ServerErr(
        500,
        "Token creation failed. No payload or secret found."
      );
    }
    try {
      return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setSubject(payload.cid)
        .setIssuedAt()
        .setExpirationTime("24 hours from now")
        .setJti(jti)
        .sign(new TextEncoder().encode(process.env.SECRET));
    } catch (error) {
      console.error(
        "An error occurred while generating/signing the JWT:",
        error
      );
      throw error;
    }
  }

  export async function tokenVerify(token: string): Promise<JWTPayload2> {
    if (!process.env.SECRET) {
      throw new ServerErr(500, "Missing secret key for token verification.");
    }
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SECRET)
      );
      return payload as JWTPayload2;
    } catch (error) {
      console.error("An error occurred while verifying the JWT:", error);
      throw error;
    }
  }

  export function getSessionData(token: string): JWTPayload2 {
    try {
      return decodeJwt(token);
    } catch (error) {
      console.error("An error occurred while decoding the JWT:", error);
      throw error;
    }
  }
}
