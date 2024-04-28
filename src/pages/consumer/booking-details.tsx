import ConsumerNavbar from "@/components/consumer/Navbar";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import { isString } from "util";
import Icon from "@mdi/react";
import { mdiArrowRightCircle, mdiCancel } from "@mdi/js";
import { DatetimeLib } from "@/lib/datetime";
import { UtilLib } from "@/lib/util";
import { useRouter } from "next/router";
import prisma from "@/lib/prisma-client";
import moment from "moment";
import { HttpVerb } from "@/constants";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const PaymentPage: React.FC<Props> = ({ booking, refundTimeFrame }) => {
  const trip = booking.BookedSeat[0].Seat.Trip;
  const depTime = DatetimeLib.formatDateForDisplay(
    trip.departureTime.toString()
  );
  const arrTime = DatetimeLib.formatDateForDisplay(trip.arrivalTime.toString());
  const stops = UtilLib.toString3(trip.intermediateStops) || "N/A";
  const amenities = UtilLib.toString3(trip.amenities) || "N/A";
  const price = trip.price.toString().concat(" MMK");
  const total = ((trip.price as unknown as number) * booking.BookedSeat.length)
    .toString()
    .concat(" MMK");

  const { hours, minutes } = DatetimeLib.calculateCancellationTime(
    booking.bookedAt.toString(),
    refundTimeFrame
  );
  const left = `${hours} hours ${minutes} minutes left`;
  const left2 = `Time left for cancellation: ${hours} hours and ${minutes} minutes.`;
  const rt = useRouter();
  const cancelBooking = async () => {
    try {
      const res = await fetch(`/api/consumer/cancel?bookingId=${booking.id}`, {
        method: HttpVerb.PATCH,
      });
      if (res.ok) {
        rt.push("/consumer/history");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ConsumerNavbar />
      <div className="section">
        <div className="columns is-centered">
          <div className="column is-half-widescreen">
            <div className="card">
              <div className="card-header">
                <div className="card-header-title">Booking Details</div>
              </div>
              <div className="card-content">
                <section className="fixed-grid has-2-cols">
                  <div className="grid">
                    <span className="cell">Bus Operator</span>
                    <span className="cell has-text-weight-medium">
                      {trip.Operator.name}
                    </span>
                    <span className="cell">Route</span>
                    <span className="cell is-flex is-align-items-center">
                      <span>
                        {trip.departureLocation + " - " + trip.arrivalLocation}
                      </span>
                    </span>
                    <span className="cell">Intermediate Stops</span>
                    <span className="cell">{stops}</span>
                    <span className="cell">Depart At</span>
                    <span className="cell">{depTime}</span>
                    <span className="cell">Arrive At</span>
                    <span className="cell">{arrTime}</span>
                    <span className="cell">Booked At</span>
                    <span className="cell">
                      {DatetimeLib.formatDateForDisplay(
                        booking.bookedAt.toString()
                      )}
                    </span>
                    <span className="cell">Amenities</span>
                    <span className="cell">{amenities}</span>
                    <span className="cell has-text-weight-medium">Price</span>
                    <span className="cell">
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        {price}
                      </span>
                      <span className="is-italic">
                        <sub> per seat</sub>
                      </span>
                    </span>
                  </div>
                </section>
                {booking.BookedSeat.map(({ Seat }, index) => {
                  const location = UtilLib.toString3(Seat.location);
                  const features = UtilLib.toString3(Seat.features);
                  return (
                    <div key={index}>
                      <hr />
                      <section className="fixed-grid has-2-cols">
                        <div className="grid">
                          <span className="cell">Seat No</span>
                          <span className="cell has-text-weight-medium">
                            {Seat.number}
                          </span>
                          <span className="cell">Location</span>
                          <span className="cell">{location}</span>
                          <span className="cell">Features</span>
                          <span className="cell">{features}</span>
                        </div>
                      </section>
                    </div>
                  );
                })}
                <hr />
                <section className="fixed-grid has-2-cols">
                  <div className="grid">
                    <span className="cell has-text-weight-medium">
                      {booking.BookedSeat.length} x Seat(s)
                    </span>
                    <span className="cell">
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        {total}
                      </span>
                      <span className="is-italic">
                        <sub> total including taxes</sub>
                      </span>
                    </span>
                  </div>
                </section>
                {moment(booking.bookedAt).minutes() > 0 &&
                  !booking.isCanceled && (
                    <>
                      <article className="message is-danger">
                        <div className="message-body">{left2}</div>
                      </article>
                      <div className="buttons is-centered">
                        <button
                          className="button is-danger has-text-danger-100"
                          onClick={cancelBooking}
                        >
                          <span className="icon">
                            <Icon path={mdiCancel} size={"1.125rem"} />
                          </span>
                          <span>Cancel Booking</span>
                        </button>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer"></footer>
    </>
  );
};

export default PaymentPage;

export const getServerSideProps = (async ({ query }) => {
  const bookingId = query.bookingId;
  if (!isString(bookingId)) return { notFound: true };
  const result = await prisma.booking.findFirstOrThrow({
    where: { id: bookingId },
    orderBy: { bookedAt: "desc" },
    include: {
      BookedSeat: {
        include: {
          Seat: { include: { Trip: { include: { Operator: true } } } },
        },
      },
    },
  });
  const { refundTimeFrame } = await prisma.settings.findFirstOrThrow({
    orderBy: { createdAt: "desc" },
  });
  const booking = JSON.parse(JSON.stringify(result)) as typeof result;
  return {
    props: { booking, refundTimeFrame },
  };
}) satisfies GetServerSideProps<{}>;
