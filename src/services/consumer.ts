import { HttpVerb } from "@/constants";
import { ConsumerSignUpPayload } from "@/lib/types";
import { UtilLib } from "@/lib/util";

export namespace ConsumerServices {
  export namespace Auth {
    export async function SignUp(payload: ConsumerSignUpPayload) {
      return fetch("/api/consumer/signup", {
        method: HttpVerb.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  }

  export async function book(ccid: string, seatsIds: string[]) {
    const context = UtilLib.encodeContext({ ccid, seatsIds });
    return fetch(`/api/consumer/book?context=${context}`, {
      method: HttpVerb.POST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
