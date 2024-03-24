import { HttpVerb } from "@/constants";
import { CredentialPayload } from "@/lib/types";
import { $Enums } from "@prisma/client";

export namespace Auth {
  export async function login(
    credential: CredentialPayload,
    userType: $Enums.UserType
  ) {
    return fetch(`/api/auth?userType=${userType}`, {
      method: HttpVerb.POST,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credential),
    });
  }
}
