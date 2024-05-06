import FilterSelectable from "@/components/common/FilterSelectable";
import PartnerAside from "@/components/operator/Aside";
import PartnerNavbar from "@/components/operator/Navbar";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { mdiMapMarker } from "@mdi/js";
import Icon from "@mdi/react";
import { getCookie } from "cookies-next";
import moment from "moment";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isString } from "util";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
export const Log: React.FC<Props> = ({ bookingList, bookingListLength }) => {
  const rt = useRouter();
  const [pageNumber, setPageNumber] = useState(1);
  useEffect(() => {
    rt.push({ query: { pageNumber } });
  }, [pageNumber]);

  return (
    <>
      <PartnerNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <PartnerAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="table-container card is-radiusless">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
                    </th>
                    <th>Trip Name</th>
                    <th>Route</th>
                    <th>Departs At</th>
                    <th>Status</th>
                    <th>Seats</th>
                    <th>Who?</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingList.map((booking, i) => {
                    const trip = booking.BookedSeat[0].Seat.Trip;
                    const seatNumbers = booking.BookedSeat.map(
                      (bs) => bs.Seat.number
                    );
                    const consumer = booking.Consumer;
                    const route = trip.departureLocation.concat(
                      " - ",
                      trip.arrivalLocation
                    );
                    return (
                      <tr key={i}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td className="is-capitalized">{trip.name}</td>
                        <td>{route}</td>
                        <td>
                          {DatetimeLib.formatDateForDisplay(
                            trip.departureTime.toString()
                          )}
                        </td>
                        <td>
                          <span className="tag is-link is-light">
                            {booking.isCanceled ? "CANCELED" : "BOOKED"}
                          </span>
                        </td>
                        <td>{UtilLib.toString3(seatNumbers)}</td>
                        <td>{consumer.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <nav className="pagination is-centered" role="navigation">
              <ul className="pagination-list">
                {Array.from({ length: Math.ceil(bookingListLength / 14) }).map(
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Log;

export const getServerSideProps = (async ({ req, query }) => {
  const operatorId = getCookie("operatorId", { req });
  const pageNumber = query.pageNumber;
  if (!isString(operatorId)) return { notFound: true };
  if (!isString(pageNumber)) return { notFound: true };

  const bookingListLength = await prisma.booking.count();
  const result = await prisma.booking.findMany({
    where: { BookedSeat: { some: { Seat: { Trip: { operatorId } } } } },
    include: {
      Consumer: true,
      BookedSeat: { include: { Seat: { include: { Trip: true } } } },
    },
    skip: (parseInt(pageNumber) - 1) * 14,
    take: 14,
  });
  const result2 = result.sort((a, b) => {
    const foo = a.BookedSeat[0].Seat.Trip.departureTime;
    const bar = b.BookedSeat[0].Seat.Trip.departureTime;
    return moment(bar).unix() - moment(foo).unix();
  });
  const bookingList = JSON.parse(JSON.stringify(result2)) as typeof result;
  return {
    props: { bookingList, bookingListLength },
  };
}) satisfies GetServerSideProps<{}>;
