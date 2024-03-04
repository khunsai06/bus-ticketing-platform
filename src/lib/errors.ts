import { httpErrorCodes } from "@/constants";
import exp from "constants";

export class CustomErr extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class HttpErr extends CustomErr {
    statusCode: number;
    statusText: string;
    constructor(statusCode: number, message?: string) {
        super(message);
        this.statusCode = statusCode;
        this.statusText = httpErrorCodes[statusCode];
    }
}

export class ClientErr extends HttpErr {}
export class ServerErr extends HttpErr {}
