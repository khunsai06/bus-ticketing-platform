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
import { TripStatus } from "@prisma/client";
import moment from "moment";

type TripFilterParams = {
  status?: string;
  date?: moment.Moment;
  dl?: string;
  al?: string;
};

const TripsPage = ({
  trips,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [tripList, setTripList] = useState<Trips>([]);
  const [filterParams, setFilterParams] = useState<TripFilterParams>({});

  useEffect(() => {
    reHydrateTripList();
  }, [filterParams]);

  useEffect(() => {
    setTripList(trips);
  }, []);

  const reHydrateTripList = async () => {
    const res = await PartnerServices.TripManager.getMany();
    await handleFetchResponse<Trips>(res, {
      successCallBack(data) {
        const filtered = data.filter((trip) => {
          const dt = moment(trip.departureTime);
          console.log(filterParams);

          return (
            (!filterParams.status || trip.status === filterParams.status) &&
            (!filterParams.date || dt.isSame(filterParams.date, "day")) &&
            (!filterParams.dl || trip.departureLocation === filterParams.dl) &&
            (!filterParams.al || trip.arrivalLocation === filterParams.al)
          );
        });
        setTripList(filtered);
      },
      errCallback: console.error,
    });
  };

  return (
    <div>
      <Link href={"/partner/trips/entry"}>Add New Trip</Link>{" "}
      <select
        onChange={(e) => {
          setFilterParams((prev) => ({ ...prev, status: e.target.value }));
        }}
      >
        <option value={""}>None</option>
        <option value={TripStatus.IDLE}>Idle</option>
        <option value={TripStatus.LAUNCHED}>Launched</option>
        <option value={TripStatus.WITHDRAWN}>Withdraw</option>
      </select>
      <select
        onChange={(e) => {
          setFilterParams((prev) => ({ ...prev, dl: e.target.value }));
        }}
      >
        <option value="Yangon">Yangon</option>
        <option value="Mandalay">Mandalay</option>
        <option value="Lashio">Lashio</option>
      </select>
      <select
        onChange={(e) => {
          setFilterParams((prev) => ({ ...prev, al: e.target.value }));
        }}
      >
        <option value="Yangon">Yangon</option>
        <option value="Mandalay">Mandalay</option>
        <option value="Lashio">Lashio</option>
      </select>
      <input
        type="date"
        onChange={(e) => {
          const dateValue = e.target.value;
          setFilterParams((prev) => ({
            ...prev,
            date: dateValue ? moment(dateValue) : undefined,
          }));
        }}
      />
      <hr />
      <ol>
        {tripList.map((trip, index) => {
          return (
            <TripItem
              key={index}
              trip={trip}
              reHydrateTripList={reHydrateTripList}
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
  reHydrateTripList: VoidFunction;
};

const TripItem: FC<TripItemProps> = ({ trip, reHydrateTripList }) => {
  const rt = useRouter();
  const dt = trip.departureTime;
  const at = trip.arrivalTime;

  const edit = () => {
    rt.push(`/partner/trips/entry?ops=edit&id=${trip.id}`);
  };
  const remove = async (id: string) => {
    const res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.DELETE
    );
    await handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };
  const launch = async (id: string) => {
    let res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.LAUNCH
    );
    await handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };

  const withdraw = async (id: string) => {
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
    <li>
      <Link href={`/partner/trips/${trip.id}`}>
        <p>
          {Utilities.Datetime.extractTimeForDisplay(dt)} - {trip.title}
        </p>
      </Link>
      <p>
        {trip.departureLocation} - {trip.arrivalLocation}
      </p>
      <p>Departs: {Utilities.Datetime.formatDateForDisplay(dt)}</p>
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
