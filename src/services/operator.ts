import { HttpVerb, XSeatOps, XTripOps } from "@/constants";
import { TripEntryPayload, type Trip2 } from "@/lib/types";

export namespace OperatorServices {
  export class TripManager {
    static async create(operatorId: string, payload: any) {
      return fetch(`/api/operator/entry-trip?operatorId=${operatorId}`, {
        method: HttpVerb.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
    static async update(id: string, payload: any) {
      return fetch(`/api/operator/entry-trip?id=${id}`, {
        method: HttpVerb.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
    static async xOperation(id: string, ops: XTripOps) {
      const method = {
        [XTripOps.DELETE]: HttpVerb.DELETE,
        [XTripOps.LAUNCH]: HttpVerb.PATCH,
        [XTripOps.WITHDRAW]: HttpVerb.PATCH,
      }[ops];
      return fetch(`/api/operator/x-trip-ops?id=${id}&ops=${ops}`, {
        method,
      });
    }
    static async getMany(operatorId: string) {
      return fetch(`/api/operator/get-trips?operatorId=${operatorId}`);
    }
  }

  export class SeatManager {
    static async xOperation(id: string, ops: XSeatOps) {
      return await fetch(`/api/operator/x-seat-ops?id=${id}&ops=${ops}`, {
        method: HttpVerb.PATCH,
      });
    }
    static async getMany(tripId: string) {
      return fetch(`/api/operator/get-seats?tripId=${tripId}`);
    }
  }

  export class ContactManger {
    static async create(operatorId: string, payload: any) {
      return fetch(`/api/operator/entry-contact?operatorId=${operatorId}`, {
        method: HttpVerb.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  }
}
