import { Role } from "@/constants";
import { SignJWT, jwtVerify, decodeJwt, type JWTPayload } from "jose";
import bcrypt from "bcrypt";
import { ClientErr, CustomErr, HttpErr, ServerErr } from "./errors";

export async function passwdHash(passwd: string) {
  const saltRounds = 10;
  return bcrypt.hash(passwd, saltRounds);
}

export async function passwdCompare(passwd: string, hash: string) {
  const result = await bcrypt.compare(passwd, hash);
  if (result === false) {
    throw new ClientErr(
      401,
      "Invalid password. Please double-check and try again."
    );
  }
  return result;
}

export type JWTPayload2 = {
  id: string;
  uname: string;
  email: string;
  role: string;
} & JWTPayload;

export async function tokenCreate(
  payload: JWTPayload2,
  secret?: string
): Promise<string> {
  const { id, uname, email, role } = payload;
  const jti = crypto.randomUUID();
  if (process.env.SECRET) {
    return new SignJWT({ uname, email, role })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(id)
      .setIssuedAt()
      .setExpirationTime("5 minutes from now")
      .setJti(jti)
      .sign(new TextEncoder().encode(process.env.SECRET));
  } else {
    throw new ServerErr(
      500,
      "Token creation failed. No payload or secret found."
    );
  }
}

export async function tokenVerify(
  token: string,
  secret: string
): Promise<JWTPayload2> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as JWTPayload2;
}

export function getSessionData(token: string): JWTPayload2 {
  return decodeJwt(token);
}
