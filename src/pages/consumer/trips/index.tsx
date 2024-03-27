import TripItem3 from "@/components/consumer/TripItem3";
import prisma from "@/lib/prisma-client";
import { Trip3 } from "@/lib/types";
import moment from "moment";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useState } from "react";

interface TripsFilterParams {
  depLoc?: string;
  arrLoc?: string;
  date?: moment.Moment;
  seat: number;
}
const ConsumerTripListPage = ({
  trips,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [tripList, setTripList] = useState<Trip3[]>(trips);
  const [filterParams, setFilterParams] = useState<TripsFilterParams>({
    seat: 1,
  });
  const reHydrateTripList = async () => {};
  return (
    <>
      <ul>
        {tripList.map((trip, index) => (
          <TripItem3 key={index} trip={trip} />
        ))}
      </ul>
    </>
  );
};

export default ConsumerTripListPage;

export const getServerSideProps = (async (ctx) => {
  try {
    const result = await prisma.trip.findMany({
      where: { status: "LAUNCHED" },
      include: { operator: true },
    });
    const trips = JSON.parse(JSON.stringify(result)) as Trip3[];
    return { props: { trips } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{ trips: Trip3[] }>;
