import { OPERATOR_SESSION_COOKIE_NAME } from "@/constants";
import prisma from "@/lib/prisma-client";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import React, { type FC, useState, useEffect } from "react";
import { Trip2 } from "@/lib/types";
import moment from "moment";
import { getCookie } from "cookies-next";
import { AuthLib } from "@/lib/auth";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import PartnerNavbar from "@/components/operator/Navbar";
import PartnerAside from "@/components/operator/Aside";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const TripsPage: FC<Props> = ({ trips }) => {
  const [tripList, setTripList] = useState<Trip2[]>(trips);

  return (
    <>
      <Link
        className="button is-link is-large"
        href={"/operator/trips/entry"}
        style={{ position: "fixed", zIndex: 100, right: 48, bottom: 48 }}
      >
        <span className="icon">
          <Icon path={mdiPlus} size={1} />
        </span>
      </Link>
      <PartnerNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <PartnerAside />
          </div>
          <main className="column has-background-white-bis">
            {/* <div className="field">
              <Link className="button is-link" href={"/operator/trips/entry"}>
                <span className="icon">
                  <Icon path={mdiPlus} size={1} />
                </span>
                <span>Add New Trip</span>
              </Link>
            </div> */}
            <div className="table-container box is-radiusless">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
                    </th>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Departs At</th>
                    <th>Arrive At</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {tripList.map((trip, index) => (
                    <TripItem2 key={index} trip={trip} />
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
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
      orderBy: { departureTime: "desc" },
    });
    return { props: { trips: JSON.parse(JSON.stringify(result)) } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{ trips: Trip2[] }>;

import { DatetimeLib } from "@/lib/datetime";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";

const TripItem2: FC<{ trip: Trip2 }> = ({ trip }) => {
  const rt = useRouter();
  const detailUrl = `/operator/trips/${trip.id}`;
  const goToDetails = () => rt.push(detailUrl);
  return (
    <tr onClick={goToDetails} style={{ cursor: "pointer" }}>
      <td>
        <input type="checkbox" />
      </td>
      <td className="is-capitalized">{trip.name}</td>
      <td>{trip.departureLocation.concat(" - ", trip.arrivalLocation)}</td>
      <td>{DatetimeLib.formatDateForDisplay(trip.departureTime)}</td>
      <td>{DatetimeLib.formatDateForDisplay(trip.arrivalTime)}</td>
      <td>
        <span className="tag is-link is-light">{trip.status}</span>
      </td>
      <td>{trip.price.toString().concat(" MMK")}</td>
    </tr>
  );
};
