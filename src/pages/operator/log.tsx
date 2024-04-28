import PartnerAside from "@/components/operator/Aside";
import PartnerNavbar from "@/components/operator/Navbar";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { getCookie } from "cookies-next";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import { isString } from "util";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
export const Log: React.FC<Props> = ({ bookingList }) => {
  console.log(bookingList);

  return (
    <>
      <PartnerNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-one-fifth">
            <PartnerAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="table-container card is-radiusless">
              <table className="table is-fullwidth is-hoverable">
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
                  {bookingList.map((booking) => {
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
                      <tr>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>{trip.name}</td>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Log;

export const getServerSideProps = (async ({ req }) => {
  const operatorId = getCookie("operatorId", { req });
  if (!isString(operatorId)) return { notFound: true };
  const result = await prisma.booking.findMany({
    where: { BookedSeat: { some: { Seat: { Trip: { operatorId } } } } },
    include: {
      Consumer: true,
      BookedSeat: { include: { Seat: { include: { Trip: true } } } },
    },
  });
  const bookingList = JSON.parse(JSON.stringify(result)) as typeof result;
  return {
    props: { bookingList },
  };
}) satisfies GetServerSideProps<{}>;
