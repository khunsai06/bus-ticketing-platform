import { HttpVerb, XSeatOperation, XTripOperation } from "@/constants";
import { type Trip } from "@/lib/types";

export namespace PartnerServices {
  export class TripManager {
    static async create(payload: any) {
      return fetch("/api/partner/entry-trip", {
        method: HttpVerb.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    static async update(id: string, payload: any) {
      return fetch(`/api/partner/entry-trip?id=${id}`, {
        method: HttpVerb.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    static async xOperation(id: string, ops: XTripOperation) {
      const method = {
        [XTripOperation.DELETE]: HttpVerb.DELETE,
        [XTripOperation.LAUNCH]: HttpVerb.PATCH,
        [XTripOperation.WITHDRAW]: HttpVerb.PATCH,
      }[ops];
      return fetch(`/api/partner/x-trip-ops?id=${id}&ops=${ops}`, {
        method,
      });
    }

    static async getMany(operatorId: string) {
      return fetch(`/api/partner/get-trips?operatorId=${operatorId}`);
    }
  }

  export class SeatManager {
    static async xOperation(id: string, ops: XSeatOperation) {
      return await fetch(`/api/partner/x-seat-ops?id=${id}&ops=${ops}`, {
        method: HttpVerb.PATCH,
      });
    }
    static async getMany(tripId: string) {
      return fetch(`/api/partner/get-seats?tripId=${tripId}`);
    }
  }
}
