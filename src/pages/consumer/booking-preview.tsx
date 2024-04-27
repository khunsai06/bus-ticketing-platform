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

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const PaymentPage: React.FC<Props> = ({ operator, trip, selectedSeats }) => {
  const depTime = DatetimeLib.formatDateForDisplay(trip.departureTime);
  const arrTime = DatetimeLib.formatDateForDisplay(trip.arrivalTime);
  const stops = UtilLib.toString3(trip.intermediateStops) || "N/A";
  const amenities = UtilLib.toString3(trip.amenities) || "N/A";
  const price = trip.price.toString().concat(" MMK");
  const total = (trip.price * selectedSeats.length).toString().concat(" MMK");

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
                <div className="card-header-title">Booking Preview</div>
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
                    Please proceed to make the payment in order to confirm your
                    booking.
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
  const contextQuery = query.context;
  if (!isString(contextQuery))
    throw new Error("Invalid or missing request query parameter(s): [data].");
  const decoded = Buffer.from(contextQuery, "base64").toString("utf-8");
  const parsed = JSON.parse(decoded);

  const operator = parsed.operator as Operator;
  const trip = parsed.trip as Trip2;
  const selectedSeats = parsed.selectedSeats as Seat[];
  return {
    props: { operator: operator, trip, selectedSeats },
  };
}) satisfies GetServerSideProps<{
  operator: Operator;
  trip: Trip2;
  selectedSeats: Seat[];
}>;
