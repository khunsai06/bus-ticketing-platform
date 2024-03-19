import { XTripOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import { PartnerServices } from "@/services/partner";
import { Utilities, handleFetchResponse } from "@/lib/util";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import React, { type FC, useState, useEffect } from "react";
import { Trip, Trips } from "@/lib/types";
import { error } from "console";

type TripFilterParams = {
  status: string;
  departureLocation: string;
  arrivalLocation: string;
};

const TripsPage = ({
  trips,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const rt = useRouter();
  const [tripList, setTripList] = useState<Trips>([]);
  const [filter, setFilter] = useState<TripFilterParams>({
    status: "",
    departureLocation: "",
    arrivalLocation: "",
  });

  useEffect(() => {
    setTripList(trips);
  }, []);

  const reHydrateTripList = async () => {
    const res = await PartnerServices.TripManager.getMany();
    await handleFetchResponse<Trips>(res, {
      successCallBack: setTripList,
      errCallback: console.error,
    });
  };

  const removeTrip = async (id: string) => {
    const res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.DELETE
    );
    await handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };
  const launchTrip = async (id: string) => {
    let res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.LAUNCH
    );
    await handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };

  const withdrawTrip = async (id: string) => {
    let res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.WITHDRAW
    );
    await handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };

  return (
    <div>
      <Link href={"/partner/trips/entry"}>Add New Trip</Link>{" "}
      <select name="">
        <option value="">None</option>
        <option value="idle">Idle</option>
        <option value="launched">Launched</option>
        <option value="withdrawn">Withdraw</option>
      </select>
      <hr />
      <ol>
        {tripList.map((trip, index) => {
          return (
            <TripItem
              key={index}
              trip={trip}
              remove={removeTrip}
              launch={launchTrip}
              withdraw={withdrawTrip}
            />
          );
        })}
      </ol>
    </div>
  );
};

export default TripsPage;

export const getServerSideProps = (async () => {
  const result = await prisma.trip.findMany({ orderBy: { id: "desc" } });
  const trips = JSON.parse(JSON.stringify(result)) as Trips;
  return { props: { trips } };
}) satisfies GetServerSideProps<{ trips: Trips }>;

type TripItemProps = {
  trip: Trip;
  remove: (id: string) => void;
  launch: (id: string) => void;
  withdraw: (id: string) => void;
};

const TripItem: FC<TripItemProps> = ({ trip, remove, launch, withdraw }) => {
  const rt = useRouter();
  const dt = trip.departureTime;
  const at = trip.arrivalTime;

  const edit = () => {
    rt.push(`/partner/trips/entry?ops=edit&id=${trip.id}`);
  };

  return (
    <li>
      <Link href={`/partner/trips/${trip.id}`}>
        <p>
          {Utilities.Datetime.extractTimeForDisplay(dt)} - {trip.title}
        </p>
      </Link>
      <p>
        {trip.departureLocation} - {trip.arrivalLocation}
      </p>
      <p>Departs: {}</p>
      <p>
        Arrives: {Utilities.Datetime.formatDateForDisplay(at)} Duration:{" "}
        {Utilities.Datetime.getHourDifference(dt, at)} Hours
      </p>
      <p>1 seat x {trip.price} MMK</p>
      <p>{trip.additional}</p>
      <p>Status: {trip.status}</p>
      {trip.status === "IDLE" && (
        <div>
          <button onClick={edit}>Edit</button>{" "}
          <button onClick={() => remove(trip.id)}>Delete</button>{" "}
          <button onClick={() => launch(trip.id)}>Launch</button>{" "}
        </div>
      )}
      {trip.status === "LAUNCHED" && (
        <div>
          <button onClick={() => withdraw(trip.id)}>Withdraw</button>
        </div>
      )}
      {trip.status === "WITHDRAWN" && (
        <div>
          <button onClick={() => remove(trip.id)}>Delete</button>{" "}
        </div>
      )}
      <hr />
    </li>
  );
};
