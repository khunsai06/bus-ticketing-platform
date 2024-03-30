// import { isString } from "@/lib/guards";
import Aside from "@/components/Aside";
import SeatEntryDialog from "@/components/operator/SeatEntryDialog";
import SeatItem2 from "@/components/operator/SeatItem2";
import { XTripOps } from "@/constants";
import useSwitch from "@/hooks/useSwitch";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { Trip4 } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { OperatorServices } from "@/services/operator";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { isString } from "node:util";
import React, { useState } from "react";
import LabelValueDisplay from "@/components/common/LabelValueDisplay";
import Navbar2 from "@/components/operator/Navbar2";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const details: React.FC<Props> = ({ trip }) => {
  const [trip2, setTrip] = useState(trip);
  const rt = useRouter();

  const reFetchTrip = async () => {
    const res = await OperatorServices.TripManager.getOne(trip2.id);
    UtilLib.handleFetchResponse<Trip4>(res, {
      successCallBack: setTrip,
      errCallback: console.error,
    });
  };

  const edit = () => rt.push(`/operator/trips/entry?ops=edit&id=${trip2.id}`);

  const remove = async () => {
    const res = await OperatorServices.TripManager.xOperation(
      trip2.id,
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
      trip2.id,
      XTripOps.LAUNCH
    );
    UtilLib.handleFetchResponse<Trip4>(res, {
      successCallBack: setTrip,
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

  const name = trip2.name;
  const route = trip2.departureLocation.concat(" - ", trip2.arrivalLocation);
  const distance = trip2.distance?.toString().concat(" km") || "N/A";
  const stops = UtilLib.toString3(trip2.intermediateStops) || "N/A";
  const departAt = DatetimeLib.formatDateForDisplay(trip2.departureTime);
  const arriveAt = DatetimeLib.formatDateForDisplay(trip2.arrivalTime);
  const price = trip2.price.toString().concat(" MMK");
  const status = trip2.status;
  const amenities = UtilLib.toString3(trip2.amenities) || "N/A";
  const extra = trip2.additional || "N/A";

  const idleActions = (
    <div className="field buttons are-small">
      <button className="button is-link is-outlined " onClick={launch}>
        Launch
      </button>
      <button
        className="button is-link is-outlined"
        onClick={dialogSwitch.open}
      >
        Add New Seat
      </button>
      <button className="button is-warning is-outlined" onClick={edit}>
        Edit
      </button>
      <button className="button is-danger is-outlined " onClick={remove}>
        Delete
      </button>
    </div>
  );

  const launchedActions = (
    <div className="field buttons are-small">
      <button className="button is-warning is-outlined">Withdraw</button>
    </div>
  );
  return (
    <>
      <Navbar2 />
      <div className="columns">
        <Aside />
        <div className="column">
          <section>
            <br />
            <h4 className="title is-4">Details</h4>
            <LabelValueDisplay label="Trip Name" value={name} />
            <LabelValueDisplay label="Route" value={route} />
            <LabelValueDisplay label="Distance" value={distance} />
            <LabelValueDisplay label="Intermediate Stops" value={stops} />
            <LabelValueDisplay label="Depart At" value={departAt} />
            <LabelValueDisplay label="Arrives At" value={arriveAt} />
            <LabelValueDisplay label="Price" value={price} />
            <LabelValueDisplay label="Status" value={status} />
            <LabelValueDisplay label="Amenities" value={amenities} />
            <LabelValueDisplay label="Extra" value={extra} />
            {status === "IDLE" && idleActions}
            {status === "LAUNCHED" && launchedActions}
            <hr />
            <h4 className="title is-4">Seats</h4>
            <SeatEntryDialog
              tripId={trip.id}
              active={dialogSwitch.value}
              closeDialog={dialogSwitch.close}
              refresh={reFetchTrip}
            />
            <table className="table is-hoverable">
              <thead>
                <tr>
                  <th>Seat Number</th>
                  <th>Location</th>
                  <th>Features</th>
                  <th>Seat Status</th>
                  <th>Action 1</th>
                  <th>Action 2</th>
                </tr>
              </thead>
              <tbody>
                {trip2.seats.map((seat, index) => (
                  <SeatItem2
                    key={index}
                    seat={seat}
                    tripStatus={status}
                    refetch={reFetchTrip}
                  />
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
};

export default details;

export const getServerSideProps = (async ({ req, query }) => {
  const id = query.id;
  if (!isString(id))
    throw new Error("Invalid or missing request query parameter(s): [id].");
  const result = await prisma.trip.findUniqueOrThrow({
    where: { id },
    include: { seats: { orderBy: { id: "desc" } } },
  });
  const trip = JSON.parse(JSON.stringify(result)) as Trip4;
  return {
    props: { trip },
  };
}) satisfies GetServerSideProps<{ trip: Trip4 }>;
