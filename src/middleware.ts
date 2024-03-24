import { $Enums } from "@prisma/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthLib } from "@/lib/auth";
import prisma from "./lib/prisma-client";

const CONSUMER_SESSION_COOKIE_NAME = `${$Enums.UserType.CONSUMER.toLowerCase()}-session`;
const PARTNER_SESSION_COOKIE_NAME = `${$Enums.UserType.PARTNER.toLowerCase()}-session`;
const ADMIN_SESSION_COOKIE_NAME = `${$Enums.UserType.ADMIN.toLowerCase()}-session`;
const excludedEndPoints = ["/partner/login"];
const partnerProtectedEndPoints = ["/partner", "/api/partner"];

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  console.log(`${req.method} - ${req.url}`);
  const pathName = req.nextUrl.pathname;
  const response = NextResponse.next();

  const hasPartnerSession = req.cookies.has(PARTNER_SESSION_COOKIE_NAME);

  const isPartnerEndPoints = partnerProtectedEndPoints.some((path) =>
    pathName.startsWith(path)
  );
  const isExcludedEndPoints = excludedEndPoints.some((path) =>
    pathName.startsWith(path)
  );

  if (isExcludedEndPoints) {
    return response;
  }

  if (isPartnerEndPoints && hasPartnerSession) {
    const token = req.cookies.get(PARTNER_SESSION_COOKIE_NAME)?.value!;
    const sessionData = await AuthLib.tokenVerify(token);
    response.cookies.set({ name: "cid", value: sessionData.cid });
    response.cookies.set({
      name: "operatorId",
      value: sessionData.operatorId!,
    });
  }
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
