import cities from "@/cities";
import FilterDate from "@/components/common/FilterDate";
import FilterSelectable from "@/components/common/FilterSelectable";
import ConsumerNavbar from "@/components/consumer/Navbar";
import ConsumerTripItem from "@/components/consumer/TripItem";
import prisma from "@/lib/prisma-client";
import { Trip2, Trip4 } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { fi } from "@faker-js/faker";
import { mdiCalendar, mdiMapMarker } from "@mdi/js";
import Icon from "@mdi/react";
import { Operator, Seat } from "@prisma/client";
import moment from "moment";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { isString } from "util";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const ConsumerTripListPage: React.FC<Props> = ({
  tripList,
  depLocList,
  arrLocList,
}) => {
  const rt = useRouter();
  const [depLocFil, setDepLocFil] = useState("");
  const [arrLocFil, setArrLocFil] = useState("");
  const [depT, setDepT] = useState("");

  useEffect(() => {
    const filters = { depLocFil, arrLocFil, depT };
    const filterCtx = UtilLib.encodeContext(filters);
    rt.push({ query: { filterCtx } });
  }, [depLocFil, arrLocFil, depT]);

  return (
    <>
      <ConsumerNavbar />
      <section className="section">
        <div className="field is-grouped is-flex-wrap-wrap">
          <FilterSelectable
            optionList={Array.from(new Set(depLocList))}
            label="From"
            icon={<Icon path={mdiMapMarker} size="1.125rem" />}
            onChange={(e) => setDepLocFil(e.currentTarget.value)}
          />
          <FilterSelectable
            optionList={Array.from(new Set(arrLocList))}
            label="To"
            icon={<Icon path={mdiMapMarker} size="1.125rem" />}
            onChange={(e) => setArrLocFil(e.currentTarget.value)}
          />
          <FilterDate
            label="When"
            min={moment()}
            icon={<Icon path={mdiCalendar} size="1.125rem" />}
            onChange={(e) => setDepT(e.target.value)}
          />
        </div>
        <ul>
          {tripList.map((trip, index) => (
            <ConsumerTripItem key={index} trip={trip} />
          ))}
        </ul>
      </section>
      <footer className="footer"></footer>
    </>
  );
};

export default ConsumerTripListPage;

export const getServerSideProps = (async ({ query }) => {
  const filterCtx = query.filterCtx;
  const filters = { depLocFil: "", arrLocFil: "", depT: "" };
  if (isString(filterCtx)) {
    const decoded = UtilLib.decodeContext(filterCtx);
    filters.depLocFil = decoded.depLocFil;
    filters.arrLocFil = decoded.arrLocFil;
    filters.depT = decoded.depT;
  }

  try {
    const startDate = new Date(filters.depT);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    const depLocList = (await prisma.trip.findMany({}))
      .map((t) => t.departureLocation)
      .sort();
    const arrLocList = (await prisma.trip.findMany({}))
      .map((t) => t.arrivalLocation)
      .sort();
    const result = await prisma.trip.findMany({
      where: {
        status: "LAUNCHED",
        departureTime: {
          gte: moment().toDate(),
        },
        ...(filters.depLocFil !== "" && {
          departureLocation: filters.depLocFil,
        }),
        ...(filters.arrLocFil !== "" && {
          arrivalLocation: filters.arrLocFil,
        }),
        ...(filters.depT !== "" && {
          departureTime: { gte: startDate, lt: endDate },
        }),
      },
      include: { Operator: true, Seats: true },
    });
    const tripList = JSON.parse(JSON.stringify(result)) as Trip4[];
    return { props: { tripList, depLocList, arrLocList } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{}>;
