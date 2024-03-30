import { httpErrorCodes } from "@/constants";
import { ClientErr, ServerErr } from "./errors";
import { NextApiRequest, NextApiResponse } from "next/types";

export namespace UtilLib {
  export function capitalize(str: string) {
    return str.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }
  /**
   * Converts an array of strings to a single space-separated string.
   *
   * @param {string[]} list - The array of strings to convert.
   * @returns {string} The space-separated string.
   */
  export function toString2(list: string[]): string {
    return list.join(" ");
  }

  /**
   * Converts an array of strings to a single comma-separated string.
   *
   * @param {string[]} inputArray - The array of strings to convert.
   * @returns {string} The comma-separated string.
   */
  export function toString3(inputArray: string[]): string {
    const commaSeparatedString = inputArray.join(", ");
    return commaSeparatedString;
  }

  /**
   * Converts a comma-separated string into an array of strings.
   *
   * @param {string} inputString - The comma-separated string to convert.
   * @returns {string[]} The array of strings.
   */
  export function toArray2(inputString: string): string[] {
    const arrayOfStrings = inputString.split(",").map((str) => str.trim());
    return arrayOfStrings;
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
      return res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof ServerErr) {
      return res.status(error.statusCode).json({
        message: httpErrorCodes[error.statusCode],
      });
    } else if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ message: httpErrorCodes[500] });
    } else {
      console.error(error);
      return res.status(500).json({ message: httpErrorCodes[500] });
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
