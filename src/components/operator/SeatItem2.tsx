import { XSeatOps } from "@/constants";
import { Seat2 } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { OperatorServices } from "@/services/operator";
import { FC } from "react";

const SeatItem2: FC<{ seat: Seat2; reHydrateSeatList: VoidFunction }> = ({
  seat,
  reHydrateSeatList,
}) => {
  const seatAvailabilityToggler = async () => {
    const operation = seat.isAvailable ? XSeatOps.LOCK : XSeatOps.OPEN;
    const res = await OperatorServices.SeatManager.xOperation(
      seat.id,
      operation
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: reHydrateSeatList,
      errCallback: console.error,
    });
  };
  return (
    <li>
      <p>
        Identifier: {seat.identifier} Status:{" "}
        {seat.isAvailable ? "FREE" : "RESERVED"}{" "}
        <button onClick={seatAvailabilityToggler}>
          {seat.isAvailable ? "Lock" : "Open"}
        </button>{" "}
      </p>
    </li>
  );
};
export default SeatItem2;
