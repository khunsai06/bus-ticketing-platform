import { OPERATOR_SESSION_COOKIE_NAME, XTripOps } from "@/constants";
import prisma from "@/lib/prisma-client";
import { OperatorServices } from "@/services/operator";
import { UtilLib } from "@/lib/util";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import React, { type FC, useState, useEffect } from "react";
import { Trip2 } from "@/lib/types";
import { Trip, TripStatus } from "@prisma/client";
import moment from "moment";
import { DatetimeLib } from "@/lib/datetime";
import { getCookie, hasCookie } from "cookies-next";
import { AuthLib } from "@/lib/auth";
import TripItem2 from "@/components/operator/TripItem2";

type TripsFilterParams = {
  status?: string;
  date?: moment.Moment;
  dl?: string;
  al?: string;
};

const TripsPage = ({
  trips,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [tripList, setTripList] = useState<Trip2[]>(trips);
  const [filterParams, setFilterParams] = useState<TripsFilterParams>({});

  useEffect(() => {
    if (
      filterParams.status !== undefined ||
      filterParams.date !== undefined ||
      filterParams.dl !== undefined ||
      filterParams.al !== undefined
    ) {
      reHydrateTripList();
    }
  }, [
    filterParams.status,
    filterParams.date,
    filterParams.dl,
    filterParams.al,
  ]);

  const reHydrateTripList = async () => {
    if (!hasCookie("operatorId"))
      throw new Error("Missing 'operatorId' cookie for data retrieval.");
    const res = await OperatorServices.TripManager.getMany(
      getCookie("operatorId")!
    );
    UtilLib.handleFetchResponse<Trip2[]>(res, {
      successCallBack(data) {
        const filtered = data.filter((trip) => {
          const dt = moment(trip.departureTime);
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

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({
      ...prev,
      [name]: name === "date" ? (value ? moment(value) : undefined) : value,
    }));
  };

  return (
    <div>
      <Link href={"/operator/trips/entry"}>Add New Trip</Link>{" "}
      <section>
        <select name="status" onChange={handleFilterChange}>
          <option value={""}>None</option>
          <option value={TripStatus.IDLE}>Idle</option>
          <option value={TripStatus.LAUNCHED}>Launched</option>
          <option value={TripStatus.WITHDRAWN}>Withdraw</option>
        </select>
        <select name="dl" onChange={handleFilterChange}>
          <option value={""}>None</option>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <select name="al" onChange={handleFilterChange}>
          <option value={""}>None</option>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <input type="date" name="date" onChange={handleFilterChange} />
      </section>
      <hr />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Departure Location</th>
            <th>Arrival Location</th>
            <th>Departs At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tripList.map((trip, index) => (
            <TripItem2 key={index} trip={trip} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripsPage;

export const getServerSideProps = (async ({ req }) => {
  try {
    const sessionCookie = getCookie(OPERATOR_SESSION_COOKIE_NAME, { req })!;
    const sessionData = AuthLib.getSessionData(sessionCookie);
    const result = await prisma.trip.findMany({
      where: { operatorId: sessionData.operatorId },
      orderBy: { id: "desc" },
    });
    return { props: { trips: JSON.parse(JSON.stringify(result)) } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{ trips: Trip2[] }>;
