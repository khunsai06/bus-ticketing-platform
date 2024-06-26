import { $Enums } from "@prisma/client";

export const iconSize = 0.8;

export enum PaymentType {
  MPU = "MPU",
  KBZPAY = "KBZPAY",
  VISA = "VISA",
}

export enum XSeatOps {
  FREE = "FREE",
  LOCK = "LOCK",
  DELETE = "DELETE",
  RESERVE = "RESERVE",
}

export enum XTripOps {
  LAUNCH = "LAUNCH",
  WITHDRAW = "WITHDRAW",
  DELETE = "DELETE",
}

export enum HttpVerb {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const CONSUMER_SESSION_COOKIE_NAME = `${$Enums.UserType.CONSUMER.toLowerCase()}-session`;
export const OPERATOR_SESSION_COOKIE_NAME = `${$Enums.UserType.OPERATOR.toLowerCase()}-session`;
export const ADMIN_SESSION_COOKIE_NAME = `${$Enums.UserType.ADMIN.toLowerCase()}-session`;

type HttpErrorCodes = {
  [key: number]: string;
};

export const httpErrorCodes: HttpErrorCodes = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot", // April Fools' joke;  RFC 2324
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",

  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

export const SEAT_LOCATIONS = {
  WINDOW: "Window",
  AISLE: "Aisle",
  MIDDLE: "Middle",
  FRONT: "Front",
  REAR: "Rear",
  EMERGENCY_EXIT: "Emergency Exit",
  BULKHEAD: "Bulkhead",
  WHEELCHAIR_ACCESSIBLE: "Wheelchair Accessible",
};

export const SEAT_FEATURES = {
  EXTRA_LEGROOM: "Extra Legroom",
  POWER_OUTLET: "Power Outlet",
  WI_FI: "Wi-Fi",
  ENTERTAINMENT_SYSTEM: "Entertainment System",
  RECLINING: "Reclining",
  TABLE: "Table",
  BLANKET: "Blanket",
  PILLOW: "Pillow",
  USB_CHARGING: "USB Charging",
  PERSONAL_SCREEN: "Personal Screen",
  OVERHEAD_STORAGE: "Overhead Storage",
  FOOD_SERVICE: "Food Service",
  BEVERAGE_SERVICE: "Beverage Service",
};
