import { httpErrorCodes } from "@/constants";
import { ClientErr, ServerErr } from "./errors";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";
import moment from "moment";

export function concatenateStrings(list: string[]): string {
  return list.join(" ");
}

export function getHourDifference(startDate: Date, endDate: Date): number {
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);
  const hourDifference = endMoment.diff(startMoment, "hours");
  return hourDifference;
}

export function formatDateForDisplay(date: Date): string {
  return moment(date).format("MMM DD, hh:mm A");
}

export function extractTimeForDisplay(date: Date): string {
  return moment(date).format("hh:mm A");
}

export function convertIsoToDatetimeLocal(isoString: string) {
  return moment(isoString).format("YYYY-MM-DDTHH:mm");
}

export function validateRequestMethod(
  req: NextApiRequest,
  allowedMethods: string[]
): void {
  const method = req.method?.toUpperCase();
  if (!method || !allowedMethods.includes(method)) {
    throw new ClientErr(405, `Method ${method} not allowed.`);
  }
}

export function handleErrorAndRespond(error: unknown, res: NextApiResponse) {
  if (error instanceof ClientErr) {
    res.status(error.statusCode).json({ message: error.message });
  } else if (error instanceof ServerErr) {
    console.error(error);
    res.status(error.statusCode).json({
      message: httpErrorCodes[error.statusCode],
    });
  } else if (error instanceof Error) {
    console.error(error);
    res.status(500).json({ message: httpErrorCodes[500] });
  } else {
  }
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}
