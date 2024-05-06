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

const TripsPage: FC<Props> = ({ tripList, tripListLength }) => {
  const rt = useRouter();
  const [pageNumber, setPageNumber] = useState(1);
  useEffect(() => {
    rt.push({ query: { pageNumber } });
  }, [pageNumber]);
  console.log(tripListLength);

  return (
    <>
      <Link
        className="button is-link is-large"
        href={"/operator/trips/entry"}
        style={{ position: "fixed", zIndex: 100, right: 48, bottom: 120 }}
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
            <div className="table-container card is-radiusless">
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
            <nav className="pagination is-centered" role="navigation">
              <ul className="pagination-list">
                {Array.from({ length: Math.ceil(tripListLength / 14) }).map(
                  (_, i) => {
                    const currentPageNumb = i + 1;
                    return (
                      <li key={i}>
                        <button
                          onClick={() => setPageNumber(currentPageNumb)}
                          className={"pagination-link".concat(
                            " ",
                            pageNumber === currentPageNumb ? "is-current" : ""
                          )}
                        >
                          {i + 1}
                        </button>
                      </li>
                    );
                  }
                )}
              </ul>
            </nav>
          </main>
        </div>
      </div>
    </>
  );
};

export default TripsPage;

export const getServerSideProps = (async ({ req, query }) => {
  try {
    const pageNumber = query.pageNumber;
    if (!isString(pageNumber)) return { notFound: true };
    const tripListLength = await prisma.trip.count();
    const sessionCookie = getCookie(OPERATOR_SESSION_COOKIE_NAME, { req })!;
    const sessionData = AuthLib.getSessionData(sessionCookie);
    const result = await prisma.trip.findMany({
      where: { operatorId: sessionData.operatorId },
      orderBy: { id: "desc" },
      skip: (parseInt(pageNumber) - 1) * 14,
      take: 14,
    });
    return {
      props: {
        tripList: JSON.parse(JSON.stringify(result)) as Trip2[],
        tripListLength,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{}>;

import { DatetimeLib } from "@/lib/datetime";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import { isString } from "util";

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
