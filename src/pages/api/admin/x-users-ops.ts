import { HttpVerb } from "@/constants";
import { AuthLib } from "@/lib/auth";
import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cid = req.query.cid;
  const role = req.query.role;
  try {
    if (req.method === HttpVerb.DELETE) {
      if (!isString(cid))
        throw new ClientErr(400, "Invalid or missing query: [cid].");
      if (!isString(role))
        throw new ClientErr(400, "Invalid or missing query: [role].");
      await prisma.$transaction(async (tx) => {
        if (role === $Enums.UserType.CONSUMER) {
          const consumer = await tx.consumer.findFirstOrThrow({
            where: { credentialId: cid },
          });
          await tx.bookedSeat.deleteMany({
            where: { Booking: { consumerId: consumer.id } },
          });
          await tx.booking.deleteMany({ where: { consumerId: consumer.id } });
          await tx.consumer.delete({
            where: { id: consumer.id },
          });
        }
        if (role === $Enums.UserType.OPERATOR) {
          const operator = await tx.operator.findFirstOrThrow({
            where: { credentialId: cid },
          });
          await tx.bookedSeat.deleteMany({
            where: { Seat: { Trip: { operatorId: operator.id } } },
          });
          await tx.seat.deleteMany({
            where: { Trip: { operatorId: operator.id } },
          });
          await tx.trip.deleteMany({ where: { operatorId: operator.id } });
          await tx.operator.delete({ where: { id: operator.id } });
        }
        await tx.credential.delete({ where: { id: cid } });
      });
      return res.status(200).end();
    } else if (req.method === HttpVerb.PATCH) {
      if (!isString(cid))
        throw new ClientErr(400, "Invalid or missing query: [cid].");
      const email = req.body.email === "" ? null : req.body.email;
      const uname = req.body.uname === "" ? null : req.body.uname;
      const passwd = req.body.passwd;
      const credential = await prisma.credential.findFirstOrThrow({
        where: { id: cid },
      });
      // const existingCredential = await prisma.credential.findFirst({
      //   where: { OR: [{ uname }, { email }] },
      // });
      // if (existingCredential?.email || existingCredential?.uname)
      //   return res.status(400).json({
      //     msg: "Credentials already in use. Please try using different credentials.",
      //   });
      let hashedPasswd = credential.passwd;
      if (isString(passwd) && passwd.length < 6) {
        hashedPasswd = await AuthLib.passwdHash(passwd);
      }
      await prisma.credential.update({
        where: { id: cid },
        data: { email, uname, passwd: hashedPasswd },
      });
      return res.status(200).end();
    } else {
      return res.status(400).end();
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
