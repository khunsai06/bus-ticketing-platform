import Cities from "@/cities";
import FilterDate from "@/components/common/FilterDate";
import FilterSelectable from "@/components/common/FilterSelectable";
import Navbar3 from "@/components/consumer/Navbar3";
import TripItem3 from "@/components/consumer/TripItem3";
import prisma from "@/lib/prisma-client";
import { Trip4 } from "@/lib/types";
import { mdiCalendar, mdiMapMarker } from "@mdi/js";
import Icon from "@mdi/react";
import moment from "moment";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useState } from "react";

interface TripsFilterParams {
  depLoc?: string;
  arrLoc?: string;
  depDate?: moment.Moment;
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const ConsumerTripListPage: React.FC<Props> = ({ trips }) => {
  const [tripList, setTripList] = useState<Trip4[]>(trips);
  const [filterParams, setFilterParams] = useState<TripsFilterParams>();

  return (
    <>
      <Navbar3 />
      <section className="section">
        <div className="columns">
          <div className="column is-narrow">
            <FilterSelectable
              optionList={Cities}
              label="From"
              icon={<Icon path={mdiMapMarker} size={0.75} />}
            />
          </div>
          <div className="column is-narrow">
            <FilterSelectable
              optionList={Cities}
              label="To"
              icon={<Icon path={mdiMapMarker} size={0.75} />}
            />
          </div>
          <div className="column is-narrow">
            <FilterDate
              value={moment()}
              label="When"
              icon={<Icon path={mdiCalendar} size={0.75} />}
            />
          </div>
        </div>
        <ul>
          {tripList.map((trip, index) => (
            <TripItem3 key={index} trip={trip} />
          ))}
        </ul>
      </section>
    </>
  );
};

export default ConsumerTripListPage;

export const getServerSideProps = (async (ctx) => {
  try {
    const result = await prisma.trip.findMany({
      where: { status: "LAUNCHED" },
      include: { operator: true, seats: true },
    });
    const trips = JSON.parse(JSON.stringify(result)) as Trip4[];
    return { props: { trips } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{ trips: Trip4[] }>;
