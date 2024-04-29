import SeatEntryDialog from "@/components/operator/SeatEntryDialog";
import { XTripOps } from "@/constants";
import useSwitch from "@/hooks/useSwitch";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { OperatorServices } from "@/services/operator";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { isString } from "node:util";
import React, { useState } from "react";
import LabelValueDisplay from "@/components/common/LabelValueDisplay";
import PartnerNavbar from "@/components/operator/Navbar";
import { Trip2 } from "@/lib/types";
import { $Enums, Consumer, Seat } from "@prisma/client";
import PartnerAside from "@/components/operator/Aside";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const PartnerTripDetails: React.FC<Props> = ({ trip, seatList }) => {
  const rt = useRouter();
  const refresh = () => rt.reload();

  const edit = () => rt.push(`/operator/trips/entry?ops=edit&id=${trip.id}`);

  const remove = async () => {
    const res = await OperatorServices.TripManager.xOperation(
      trip.id,
      XTripOps.DELETE
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack(_) {
        rt.replace("/operator/trips");
      },
      errCallback: console.error,
    });
  };

  const launch = async () => {
    const res = await OperatorServices.TripManager.xOperation(
      trip.id,
      XTripOps.LAUNCH
    );
    UtilLib.handleFetchResponse<Trip2>(res, {
      successCallBack: refresh,
      errCallback: console.error,
    });
  };

  const withdraw = async (id: string) => {
    const res = await OperatorServices.TripManager.xOperation(
      id,
      XTripOps.WITHDRAW
    );
    UtilLib.handleFetchResponse(res, {
      errCallback: console.error,
    });
  };

  const dialogSwitch = useSwitch();

  const name = trip.name;
  const route = trip.departureLocation.concat(" - ", trip.arrivalLocation);
  const distance = trip.distance?.toString().concat(" km") || "N/A";
  const stops = UtilLib.toString3(trip.intermediateStops) || "N/A";
  const departAt = DatetimeLib.formatDateForDisplay(
    trip.departureTime.toString()
  );
  const arriveAt = DatetimeLib.formatDateForDisplay(
    trip.arrivalTime.toString()
  );
  const price = trip.price.toString().concat(" MMK");
  const status = trip.status;
  const amenities = UtilLib.toString3(trip.amenities) || "N/A";
  const extra = trip.additional || "N/A";

  return (
    <>
      <PartnerNavbar />
      <SeatEntryDialog
        tripId={trip.id}
        active={dialogSwitch.value}
        closeDialog={dialogSwitch.close}
        refresh={refresh}
      />
      <button
        onClick={dialogSwitch.open}
        className="button is-link is-large"
        style={{ position: "fixed", zIndex: 100, right: 48, bottom: 48 }}
      >
        <span className="icon">
          <Icon path={mdiPlus} size={1} />
        </span>
      </button>
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <PartnerAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="columns">
              <div className="column">
                <div className="field">
                  {/* <button
                    className="button is-link"
                    onClick={dialogSwitch.open}
                  >
                    <span className="icon">
                      <Icon path={mdiPlus} size={1} />
                    </span>
                    <span>Add New Seat</span>
                  </button> */}
                </div>
                <div className="table-container card is-radiusless">
                  <table className="table is-fullwidth is-hoverable">
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" />
                        </th>
                        <th>Number</th>
                        <th>Status</th>
                        <th>Location/Features</th>
                        <th>Passenger</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seatList.map((seat, index) => (
                        <SeatItem2
                          key={index}
                          consumer={
                            seat.BookedSeat.map((bs) => bs.Booking.Consumer)[0]
                          }
                          seat={seat}
                          tripStatus={status}
                          refetch={refresh}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="column is-4 pl-0">
                <div className="card">
                  <div className="card-header">
                    <p className="card-header-title">Trip Details</p>
                  </div>
                  <div className="card-content">
                    <LabelValueDisplay label="Trip Name" value={name} />
                    <LabelValueDisplay label="Route" value={route} />
                    <LabelValueDisplay label="Distance" value={distance} />
                    <LabelValueDisplay
                      label="Intermediate Stops"
                      value={stops}
                    />
                    <LabelValueDisplay label="Depart At" value={departAt} />
                    <LabelValueDisplay label="Arrives At" value={arriveAt} />
                    <LabelValueDisplay label="Price" value={price} />
                    <div className="field">
                      <span className="has-text-weight-medium">Status: </span>
                      <span className="tag is-link is-light">{status}</span>
                    </div>
                    <LabelValueDisplay label="Amenities" value={amenities} />
                    <LabelValueDisplay label="Extra" value={extra} />
                  </div>
                  <footer className="card-footer">
                    {status === "IDLE" && (
                      <>
                        <a className="card-footer-item" onClick={launch}>
                          Launch
                        </a>
                        <a className="card-footer-item" onClick={edit}>
                          Edit
                        </a>
                        <a className="card-footer-item" onClick={remove}>
                          Delete
                        </a>
                      </>
                    )}
                    {/* {status === "LAUNCHED" && (
                      <a className="card-footer-item" onClick={remove}>
                        Withdraw
                      </a>
                    )} */}
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerTripDetails;

export const getServerSideProps = (async ({ req, query }) => {
  const id = query.id;
  if (!isString(id))
    throw new Error("Invalid or missing request query parameter(s): [id].");

  const { Seats, ...trip } = await prisma.trip.findUniqueOrThrow({
    where: { id },
    include: {
      Seats: {
        include: {
          BookedSeat: {
            include: { Booking: { include: { Consumer: true } } },
            distinct: ["bookingId"],
            orderBy: { Booking: { bookedAt: "desc" } },
          },
        },
        orderBy: { id: "desc" },
      },
    },
  });

  const trip2 = JSON.parse(JSON.stringify(trip)) as typeof trip;
  const seatList = JSON.parse(JSON.stringify(Seats)) as typeof Seats;
  return {
    props: { trip: trip2, seatList },
  };
}) satisfies GetServerSideProps<{}>;

import { XSeatOps } from "@/constants";
import { FC } from "react";
import Icon from "@mdi/react";
import { mdiOpenInNew, mdiPlus } from "@mdi/js";
import Link from "next/link";

type SeatItemProps = {
  seat: Seat;
  consumer?: Consumer;
  tripStatus: $Enums.TripStatus;
  refetch: VoidFunction;
};

const SeatItem2: FC<SeatItemProps> = ({
  seat,
  consumer,
  tripStatus,
  refetch,
}) => {
  const location = UtilLib.toString3(seat.location);
  const features = UtilLib.toString3(seat.features);
  const launched = tripStatus === "LAUNCHED";
  const withdrawn = tripStatus === "WITHDRAWN";
  const reserved = seat.status === "BOOKED";
  const disableLock = withdrawn || reserved;
  const disableDelete = launched || withdrawn;

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
  const actions = (
    <div className="buttons is-flex-direction-column is-align-items-start">
      {seat.status === "FREE" ? (
        <button
          className="button is-small is-link"
          disabled={disableLock}
          onClick={lockSeat}
        >
          Lock
        </button>
      ) : (
        <button
          className="button is-small is-link"
          disabled={disableLock}
          onClick={unLockSeat}
        >
          Unlock
        </button>
      )}
      <button
        className="button is-small is-danger has-text-danger-100"
        disabled={disableDelete}
        onClick={deleteSeat}
      >
        Delete
      </button>
    </div>
  );
  return (
    <>
      <tr>
        <td>
          <input type="checkbox" />
        </td>
        <td>{seat.number}</td>
        <td>
          <span className="tag is-link is-light">{seat.status}</span>
        </td>
        <td>
          <p>{location}</p>
          <p>{features}</p>
        </td>
        <td>
          {consumer && (
            <button className="button is-small">
              <span>{consumer?.name} </span>
              <span className="icon">
                <Icon path={mdiOpenInNew} size="1rem" />
              </span>
            </button>
          )}
        </td>
        <td>{actions}</td>
      </tr>
    </>
  );
};
