import { $Enums } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { AuthLib } from "@/lib/auth";
import {
  ADMIN_SESSION_COOKIE_NAME,
  CONSUMER_SESSION_COOKIE_NAME,
  OPERATOR_SESSION_COOKIE_NAME,
} from "./constants";

const excludedEndPoints = [
  "/consumer/login",
  "/consumer/signup",
  "/operator/login",
  "/operator/register",
  "/api/operator/register",
  "/admin/login",
  "/api/consumer/signup",
  "/api/auth",
  "/api/logout",
  "/api/consumer/inquiry",
];
const operatorEndPoints = ["/operator", "/api/operator"];
const consumerEndPoints = ["/consumer", "/api/consumer"];
const adminEndPoints = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  console.log(`${req.method} - ${req.url}`);
  const pathName = req.nextUrl.pathname;
  const response = NextResponse.next();

  if (pathName === "/")
    return NextResponse.redirect(new URL("/consumer", req.url));
  if (pathName === "/operator")
    return NextResponse.redirect(new URL("/operator/dash", req.url));
  if (pathName === "/admin")
    return NextResponse.redirect(new URL("/admin/dash", req.url));
  const isExcludedEndPoints = excludedEndPoints.some((path) =>
    pathName.startsWith(path)
  );
  if (isExcludedEndPoints) return response;

  const hasOperatorSession = req.cookies.has(OPERATOR_SESSION_COOKIE_NAME);
  const hasConsumerSession = req.cookies.has(CONSUMER_SESSION_COOKIE_NAME);
  const hasAdminSession = req.cookies.has(ADMIN_SESSION_COOKIE_NAME);
  const isOperatorEndPoints = operatorEndPoints.some((path) =>
    pathName.startsWith(path)
  );
  const isConsumerEndPoints = consumerEndPoints.some((path) =>
    pathName.startsWith(path)
  );
  const isAdminEndPoints = adminEndPoints.some((path) =>
    pathName.startsWith(path)
  );
  const operatorLoginUrl = new URL("/operator/login", req.url);
  const consumerLoginUrl = new URL("/consumer/login", req.url);
  const adminLoginUrl = new URL("/admin/login", req.url);

  if (isOperatorEndPoints && !hasOperatorSession)
    return NextResponse.redirect(operatorLoginUrl);
  if (isConsumerEndPoints && !hasConsumerSession)
    return NextResponse.redirect(consumerLoginUrl);
  if (isAdminEndPoints && !hasAdminSession)
    return NextResponse.redirect(adminLoginUrl);

  if (isOperatorEndPoints) {
    const token = req.cookies.get(OPERATOR_SESSION_COOKIE_NAME)?.value!;
    const sessionData = await AuthLib.tokenVerify(token);
    if (sessionData.userType !== $Enums.UserType.OPERATOR)
      return NextResponse.redirect(operatorLoginUrl);
    response.cookies.set({ name: "ocid", value: sessionData.sub! });
    response.cookies.set({
      name: "operatorId",
      value: sessionData.operatorId!,
    });
    return response;
  }

  if (isConsumerEndPoints) {
    const token = req.cookies.get(CONSUMER_SESSION_COOKIE_NAME)?.value!;
    const sessionData = await AuthLib.tokenVerify(token);
    if (sessionData.userType !== $Enums.UserType.CONSUMER)
      return NextResponse.redirect(consumerLoginUrl);
    response.cookies.set({ name: "ccid", value: sessionData.sub! });
    response.cookies.set({
      name: "consumerId",
      value: sessionData.consumerId!,
    });
    return response;
  }

  if (isAdminEndPoints) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value!;
    const sessionData = await AuthLib.tokenVerify(token);
    if (sessionData.userType !== $Enums.UserType.ADMIN)
      return NextResponse.redirect(adminLoginUrl);
    response.cookies.set({ name: "acid", value: sessionData.sub! });
    return response;
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
