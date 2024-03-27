// import { isString } from "@/lib/guards";
import { XTripOps } from "@/constants";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { Trip2 } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { OperatorServices } from "@/services/operator";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { isString } from "node:util";
import React, { useState } from "react";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const details: React.FC<Props> = ({ trip }) => {
  const [_trip, setTrip] = useState(trip);
  const rt = useRouter();
  const departAt = DatetimeLib.formatDateForDisplay(_trip.departureTime);
  const arriveAt = DatetimeLib.formatDateForDisplay(_trip.arrivalTime);
  const status = _trip.status;

  const edit = () => rt.push(`/operator/trips/entry?ops=edit&id=${_trip.id}`);

  const remove = async () => {
    const res = await OperatorServices.TripManager.xOperation(
      _trip.id,
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
      _trip.id,
      XTripOps.LAUNCH
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack(_) {
        setTrip((prev) => ({ ...prev, status: "LAUNCHED" }));
      },
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

  const generate = async () => {};

  const idleActions = (
    <div>
      <button onClick={remove}>Delete</button>{" "}
      <button onClick={edit}>Edit</button>{" "}
      <button onClick={launch}>Launch</button>
    </div>
  );

  const launchedActions = (
    <div>
      <button>Withdraw</button>
    </div>
  );

  const withdrawnActions = (
    <div>
      <button onClick={remove}>Delete</button>
    </div>
  );

  return (
    <section>
      <div>
        <h4>Details</h4>
        <div>Name: {_trip.title}</div>
        <div>
          Route: {_trip.departureLocation} - {_trip.arrivalLocation}
        </div>
        <div>
          Stops: {UtilLib.arrayToCommaSeparatedString(_trip.intermediateStops)}
        </div>
        <div>Distance: {_trip.distance} km</div>
        <div>Depart At: {departAt}</div>
        <div>Arrives At: {arriveAt}</div>
        <div>Price: {_trip.price} MMK</div>
        <div>Status: {_trip.status}</div>
        <div>
          Amenities: {UtilLib.arrayToCommaSeparatedString(_trip.amenities)}
        </div>
        <div>Extra: {_trip.additional || "N/A"}</div>
        <br />
        {status === "IDLE" && idleActions}
        {status === "LAUNCHED" && launchedActions}
        {status === "WITHDRAWN" && withdrawnActions}
      </div>
      <div>
        <h4>Seats</h4>
        <div>
          <button onClick={generate}>generate</button>
        </div>
      </div>
    </section>
  );
};

export default details;

export const getServerSideProps = (async ({ req, query }) => {
  const id = query.id;
  if (!isString(id))
    throw new Error("Invalid or missing request query parameter(s): [id].");
  const result = await prisma.trip.findFirst({ where: { id } });
  const trip = JSON.parse(JSON.stringify(result)) as Trip2;
  return {
    props: { trip },
  };
}) satisfies GetServerSideProps<{ trip: Trip2 }>;
