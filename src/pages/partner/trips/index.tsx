import { XTripOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import {
  getHourDifference,
  formatDateForDisplay,
  extractTimeForDisplay,
} from "@/lib/util";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import React, { type FC, useState, useEffect } from "react";
import { TLSSocket } from "tls";

const TripsPage = ({
  trips,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const rt = useRouter();
  const [tripList, setTripList] = useState(trips);
  const [filter, setFilter] = useState(rt.query.filter as string);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (filter !== "") {
      params.set("filter", filter);
    } else {
      params.delete("filter");
    }
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.replaceState({}, "", newUrl);
    if (filter === "idle") {
      setTripList((prev) => trips.filter((t) => t.status === "IDLE"));
    } else if (filter === "launched") {
      setTripList((prev) => trips.filter((t) => t.status === "LAUNCHED"));
    } else if (filter === "withdrawn") {
      setTripList((prev) => trips.filter((t) => t.status === "WITHDRAWN"));
    } else {
      setTripList(trips);
    }
  }, [filter]);

  const remove = (id: string) =>
    xTripOperation(id, XTripOperation.delete).then((res) => {
      if (res.ok) {
        const newTrips = trips.filter((t) => t.id !== id);
        setTripList(newTrips);
      }
    });
  const launch = (id: string) =>
    xTripOperation(id, XTripOperation.launch).then((res) => {
      if (res.ok) {
        const newTrips = trips.map((t) => {
          if (t.id === id) {
            t.status = "LAUNCHED";
          }
          return t;
        });
        setTripList(newTrips);
      }
    });
  const withdraw = (id: string) =>
    xTripOperation(id, XTripOperation.withdraw).then((res) => {
      if (res.ok) {
        const newTrips = trips.map((t) => {
          if (t.id === id) {
            t.status = "WITHDRAWN";
          }
          return t;
        });
        setTripList(newTrips);
      }
    });
  return (
    <div>
      <Link href={"/partner/trips/entry"}>Add New Trip</Link>{" "}
      <select
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
        }}
      >
        <option value="">None</option>
        <option value="idle">idle</option>
        <option value="launched">launched</option>
        <option value="withdrawn">withdraw</option>
      </select>
      <hr />
      <ol>
        {tripList.map((trip, index) => {
          return (
            <TripItem
              key={index}
              trip={trip}
              remove={remove}
              launch={launch}
              withdraw={withdraw}
            />
          );
        })}
      </ol>
    </div>
  );
};

export default TripsPage;

type PrismaReturnTrip = Prisma.PromiseReturnType<
  typeof prisma.trip.findFirstOrThrow
>;
type Trip = Omit<
  PrismaReturnTrip,
  "departureTime" | "arrivalTime" | "price"
> & {
  departureTime: string;
  arrivalTime: string;
  price: number;
};
type Trips = Trip[];

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
  const dt = new Date(trip.departureTime);
  const at = new Date(trip.arrivalTime);

  const edit = () => {
    rt.push(`/partner/trips/entry?ops=edit&id=${trip.id}`);
  };
  return (
    <li>
      <Link href={`/partner/trips/${trip.id}`}>
        <p>
          {extractTimeForDisplay(dt)} - {trip.title}
        </p>
      </Link>
      <p>
        {trip.departureLocation} - {trip.arrivalLocation}
      </p>
      <p>Departs: {formatDateForDisplay(dt)}</p>
      <p>
        Arrives: {formatDateForDisplay(at)} Duration:{" "}
        {getHourDifference(dt, at)} Hours
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
        <button onClick={() => withdraw(trip.id)}>withdraw</button>
      )}
      <hr />
    </li>
  );
};

const xTripOperation = (id: string, ops: XTripOperation) => {
  const method = {
    [XTripOperation.delete]: "DELETE",
    [XTripOperation.launch]: "PATCH",
    [XTripOperation.withdraw]: "PATCH",
  }[ops];
  return fetch(`/api/partner/x-trip-ops?id=${id}&ops=${ops.toString()}`, {
    method,
  });
};
