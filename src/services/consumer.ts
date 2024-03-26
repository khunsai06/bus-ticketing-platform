import { HttpVerb } from "@/constants";
import { ConsumerSignUpPayload } from "@/lib/types";

export namespace ConsumerServices {
  export class Auth {
    static async SignUp(payload: ConsumerSignUpPayload) {
      return fetch("/api/consumer/signup", {
        method: HttpVerb.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  }
}
