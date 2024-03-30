import { XSeatOps } from "@/constants";
import { UtilLib } from "@/lib/util";
import { OperatorServices } from "@/services/operator";
import { $Enums, Seat } from "@prisma/client";
import { FC } from "react";

type Props = {
  seat: Seat;
  tripStatus: $Enums.TripStatus;
  refetch: VoidFunction;
};

const SeatItem2: FC<Props> = ({ seat, tripStatus, refetch }) => {
  const location = UtilLib.toString3(seat.location) || "N/A";
  const features = UtilLib.toString3(seat.features) || "N/A";
  const launched = tripStatus === "LAUNCHED";
  const withdrawn = tripStatus === "WITHDRAWN";
  const reserved = seat.status === "RESERVED";
  const disableAction1 = withdrawn || reserved || seat.reservationId !== null;
  const disableAction2 = launched || withdrawn;

  const lockSeat = async () => {
    const res = await OperatorServices.SeatManager.xOperation(
      seat.id,
      XSeatOps.LOCK
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: refetch,
      errCallback: console.error,
    });
  };

  const unLockSeat = async () => {
    const res = await OperatorServices.SeatManager.xOperation(
      seat.id,
      XSeatOps.FREE
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: refetch,
      errCallback: console.error,
    });
  };
  const deleteSeat = async () => {
    const res = await OperatorServices.SeatManager.xOperation(
      seat.id,
      XSeatOps.DELETE
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: refetch,
      errCallback: console.error,
    });
  };
  const action1 =
    seat.status === "FREE" ? (
      <button
        className="button is-small is-link is-outlined"
        disabled={disableAction1}
        onClick={lockSeat}
      >
        Lock
      </button>
    ) : (
      <button
        className="button is-small is-link is-outlined"
        disabled={disableAction1}
        onClick={unLockSeat}
      >
        Unlock
      </button>
    );

  const action2 = (
    <button
      className="button is-small is-danger is-outlined"
      disabled={disableAction2}
      onClick={deleteSeat}
    >
      Delete
    </button>
  );
  return (
    <>
      <tr>
        <td>{seat.number}</td>
        <td>{location}</td>
        <td>{features}</td>
        <td>{seat.status}</td>
        <td>{action1}</td>
        <td>{action2}</td>
      </tr>
    </>
  );
};
export default SeatItem2;
