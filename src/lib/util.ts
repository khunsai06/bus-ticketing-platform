import { httpErrorCodes } from "@/constants";
import { ClientErr, ServerErr } from "./errors";
import { NextApiRequest, NextApiResponse } from "next/types";
import moment from "moment";
import { boolean } from "zod";

export namespace Utilities {
  export class Datetime {
    static getHourDifference(startIsoString: string, endIsoString: string): number {
      const startMoment = moment(startIsoString);
      const endMoment = moment(endIsoString);
      const hourDifference = endMoment.diff(startMoment, "hours");
      return hourDifference;
    }

    static formatDateForDisplay(isoString: string): string {
      return moment(isoString).format("MMM DD, hh:mm A");
    }

    static extractTimeForDisplay(isoString: string): string {
      return moment(isoString).format("hh:mm A");
    }

    static convertIsoToDatetimeLocal(isoString: string) {
      return moment(isoString).format("YYYY-MM-DDTHH:mm");
    }
  }
  export function concatenateStrings(list: string[]): string {
    return list.join(" ");
  }
}

export function validateRequestMethod(req: NextApiRequest, allowedMethods: string[]): void {
  const method = req.method?.toUpperCase();
  if (!method || !allowedMethods.includes(method)) {
    throw new ClientErr(405, `Method ${method} not allowed.`);
  }
}

type SuccessCallBack<T> = (data: T) => void;
type ErrorCallBack = (errorMessage: string) => void;

interface HandleFetchOptions<T> {
  errCallback?: ErrorCallBack;
  successCallBack?: SuccessCallBack<T>;
}

export async function handleFetchResponse<T>(res: Response, options?: HandleFetchOptions<T>) {
  const { errCallback, successCallBack } = options || {};
  const parsed = await res.json();
  if (res.ok && successCallBack) successCallBack(parsed);
  if (!res.ok && res.status >= 500) throw new Error(parsed.message);
  if (!res.ok && res.status >= 400 && res.status < 500 && errCallback) errCallback(parsed.message);
  return res.ok;
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
