import ConsumerNavbar from "@/components/consumer/Navbar";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import { isString } from "util";
import { Operator, Seat } from "@prisma/client";
import { Trip2 } from "@/lib/types";
import Icon from "@mdi/react";
import { mdiArrowRightCircle } from "@mdi/js";
import { DatetimeLib } from "@/lib/datetime";
import { UtilLib } from "@/lib/util";
import { useRouter } from "next/router";
import { userAgent } from "next/server";
import prisma from "@/lib/prisma-client";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const PaymentPage: React.FC<Props> = ({ booking }) => {
  const trip = booking.Seats[0].Trip;
  const depTime = DatetimeLib.formatDateForDisplay(
    trip.departureTime.toString()
  );
  const arrTime = DatetimeLib.formatDateForDisplay(trip.arrivalTime.toString());
  const stops = UtilLib.toString3(trip.intermediateStops) || "N/A";
  const amenities = UtilLib.toString3(trip.amenities) || "N/A";
  const price = trip.price.toString().concat(" MMK");
  const total = (trip.price.toNumber() * selectedSeats.length)
    .toString()
    .concat(" MMK");

  const rt = useRouter();
  const startPayment = async () => {
    const ctxData = selectedSeats.map((s) => s.id);
    const context = UtilLib.encodeContext(ctxData);
    try {
      const res = await fetch(`/api/consumer/payment?context=${context}`, {
        method: "POST",
      });
      if (res.ok) {
        const webPaymentUrl = (await res.json()).webPaymentUrl;
        rt.replace(webPaymentUrl);
        console.log(webPaymentUrl);
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
                      {operator.name}
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
                {selectedSeats.map((seat, index) => {
                  const location = UtilLib.toString3(seat.location);
                  const features = UtilLib.toString3(seat.features);
                  return (
                    <div key={index}>
                      <hr />
                      <section className="fixed-grid has-2-cols">
                        <div className="grid">
                          <span className="cell">Seat No</span>
                          <span className="cell has-text-weight-medium">
                            {seat.number}
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
                      {selectedSeats.length} x Seat(s)
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
                <div className="message is-info">
                  <p className="message-body">
                    Make payment to confirm the booking
                  </p>
                </div>
                <div className="buttons is-centered">
                  <button className="button is-link" onClick={startPayment}>
                    <span className="icon">
                      <Icon path={mdiArrowRightCircle} size={"1.125rem"} />
                    </span>
                    <span>Proceed to Payment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    include: { Seats: { include: { Trip: true } } },
  });
  const booking = JSON.parse(JSON.stringify(result)) as typeof result;
  return {
    props: { booking },
  };
}) satisfies GetServerSideProps<{}>;
