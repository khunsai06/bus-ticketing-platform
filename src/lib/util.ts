import { httpErrorCodes } from "@/constants";
import { ClientErr, ServerErr } from "./errors";
import { NextApiRequest, NextApiResponse } from "next/types";

export namespace UtilLib {
  export function concatenateStrings(list: string[]): string {
    return list.join(" ");
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
      console.error(error);
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof ServerErr) {
      console.error(error);
      res.status(error.statusCode).json({
        message: httpErrorCodes[error.statusCode],
      });
    } else if (error instanceof Error) {
      console.error(error);
      res.status(500).json({ message: httpErrorCodes[500] });
    }
  }
  type SuccessCallBack<T> = (data: T) => void;
  type ErrorCallBack = (errorMessage: string) => void;

  interface HandleFetchOptions<T> {
    errCallback?: ErrorCallBack;
    successCallBack?: SuccessCallBack<T>;
  }

  export async function handleFetchResponse<T>(
    res: Response,
    options?: HandleFetchOptions<T>
  ) {
    const { errCallback, successCallBack } = options || {};
    const parsed = await res.json();
    if (res.ok && successCallBack) successCallBack(parsed);
    if (!res.ok && res.status >= 500) throw new Error(parsed.message);
    if (!res.ok && res.status >= 400 && res.status < 500 && errCallback)
      errCallback(parsed.message);
    return res;
  }
}
