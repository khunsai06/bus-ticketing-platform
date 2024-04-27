import cities from "@/cities";
import FilterDate from "@/components/common/FilterDate";
import FilterSelectable from "@/components/common/FilterSelectable";
import ConsumerNavbar from "@/components/consumer/Navbar";
import ConsumerTripItem from "@/components/consumer/TripItem";
import prisma from "@/lib/prisma-client";
import { Trip2, Trip4 } from "@/lib/types";
import { mdiCalendar, mdiMapMarker } from "@mdi/js";
import Icon from "@mdi/react";
import { Operator, Seat } from "@prisma/client";
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
  const [filterParams, setFilterParams] = useState<TripsFilterParams>();

  return (
    <>
      <ConsumerNavbar />
      <section className="section">
        <div className="level">
          <div className="level-right">
            <div className="level-item">
              <FilterSelectable
                optionList={cities.map((c) => ({ value: c, option: c }))}
                label="From"
                icon={<Icon path={mdiMapMarker} size="1.125rem" />}
              />
            </div>
            <div className="level-item">
              <FilterSelectable
                optionList={cities.map((c) => ({ value: c, option: c }))}
                label="To"
                icon={<Icon path={mdiMapMarker} size="1.125rem" />}
              />
            </div>
            <div className="level-item">
              <FilterDate
                defaultValue={moment()}
                label="When"
                icon={<Icon path={mdiCalendar} size="1.125rem" />}
              />
            </div>
          </div>
        </div>
        <ul>
          {trips.map((trip, index) => (
            <ConsumerTripItem key={index} trip={trip} />
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
      include: { Operator: true, Seats: true },
    });
    const trips = JSON.parse(JSON.stringify(result)) as Trip4[];
    return { props: { trips } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{ trips: Trip4[] }>;
