import { OPERATOR_SESSION_COOKIE_NAME, XTripOps } from "@/constants";
import prisma from "@/lib/prisma-client";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import React, { type FC, useState, useEffect } from "react";
import { Trip2 } from "@/lib/types";
import { TripStatus } from "@prisma/client";
import moment from "moment";
import { getCookie } from "cookies-next";
import { AuthLib } from "@/lib/auth";
import TripItem2 from "@/components/operator/TripItem2";
import FilterSelectable from "@/components/common/FilterSelectable";
import Icon from "@mdi/react";
import { mdiBusClock, mdiBusMarker, mdiBusWrench, mdiPlus } from "@mdi/js";
import Navbar2 from "@/components/operator/Navbar2";
import cities from "@/cities";
import FilterDate from "@/components/common/FilterDate";

type TripsFilterParams = {
  status?: string;
  date?: moment.Moment;
  dl?: string;
  al?: string;
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const TripsPage: FC<Props> = ({ trips }) => {
  const [tripList, setTripList] = useState<Trip2[]>(trips);
  const [filterParams, setFilterParams] = useState<TripsFilterParams>({});

  useEffect(() => {
    if (
      filterParams.status !== undefined ||
      filterParams.date !== undefined ||
      filterParams.dl !== undefined ||
      filterParams.al !== undefined
    ) {
      // filter logic here
    }
  }, [
    filterParams.status,
    filterParams.date,
    filterParams.dl,
    filterParams.al,
  ]);

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
    <>
      <Navbar2 />
      <main className="section">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <Link
                className="button is-link"
                href={"/portal/operator/trips/entry"}
              >
                <span className="icon">
                  <Icon path={mdiPlus} size="1.5rem" />
                </span>
                <span>Add New Trip</span>
              </Link>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <FilterSelectable
                label="Status"
                icon={<Icon path={mdiBusWrench} />}
                onChange={handleFilterChange}
                optionList={[
                  { value: "", option: "None" },
                  { value: TripStatus.IDLE, option: "Idle" },
                  { value: TripStatus.LAUNCHED, option: "Launched" },
                  { value: TripStatus.WITHDRAWN, option: "Withdrawn" },
                ]}
              />
            </div>
            <div className="level-item">
              <FilterSelectable
                label={"Depart"}
                icon={<Icon path={mdiBusMarker} />}
                optionList={cities.map((c) => ({ value: c, option: c }))}
                onChange={handleFilterChange}
              />
            </div>
            <div className="level-item">
              <FilterSelectable
                label={"Arrive"}
                icon={<Icon path={mdiBusMarker} />}
                optionList={cities.map((c) => ({ value: c, option: c }))}
                onChange={handleFilterChange}
              />
            </div>
            <div className="level-item">
              <FilterDate
                label="Date"
                min={moment()}
                icon={<Icon path={mdiBusClock} />}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
        <table className="table is-fullwidth is-hoverable">
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
      </main>
    </>
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
