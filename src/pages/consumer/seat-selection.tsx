import LabelValueDisplay from "@/components/common/LabelValueDisplay";
import Footer from "@/components/consumer/Footer";
import Navbar3 from "@/components/consumer/Navbar3";
import SeatItem3 from "@/components/consumer/SeatItem3";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { Trip2 } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { mdiArrowRightCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { Operator, Seat } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { isString } from "util";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const SeatSelectionPage: React.FC<Props> = ({ seats, trip, operator }) => {
  const route = trip.departureLocation.concat(" - ", trip.arrivalLocation);
  const price = trip.price.toString().concat(" MMK");
  const departAt = DatetimeLib.formatDateForDisplay(trip.departureTime);
  const arriveAt = DatetimeLib.formatDateForDisplay(trip.arrivalTime);
  const placeHolderUrl = "https://placehold.co/144x48";
  const logoUrl = operator.logo || placeHolderUrl;
  const operatorName = UtilLib.capitalize(operator.name);

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const total = selectedSeats.length * trip.price;
  const selectItem = (selectedSeat: Seat) =>
    setSelectedSeats((prev) => [...prev, selectedSeat]);
  const unSelectItem = (unSelectedSeat: Seat) =>
    setSelectedSeats((prev) =>
      prev.filter((seat) => seat.id !== unSelectedSeat.id)
    );

  const rt = useRouter();
  const toBookingDetails = () => {
    const data = {
      operator,
      trip,
      selectedSeats,
    };
    const context = Buffer.from(JSON.stringify(data)).toString("base64");
    rt.push({
      pathname: "/consumer/booking-details",
      query: { context },
    });
  };
  return (
    <>
      <Navbar3 />
      <div className="section">
        <div className="columns is-multiline">
          <section className="column is-one-third-widescreen">
            <div className="card">
              <div className="card-header">
                <p className="card-header-title">Trip Summary</p>
              </div>
              <div className="card-content">
                <LabelValueDisplay label="Operator" value={operatorName} />
                <LabelValueDisplay label="Route" value={route} />
                <LabelValueDisplay label="Depart At" value={departAt} />
                <LabelValueDisplay label="Arrive At" value={arriveAt} />
                <div className="field">
                  <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                    {price}
                  </span>
                  <span className="is-italic">
                    <sub> per seat</sub>
                  </span>
                </div>
              </div>
            </div>
          </section>
          <section className="column is-one-third-widescreen">
            <div className="fixed-grid has-4-cols">
              <div className="grid">
                {seats.map((seat, index) => {
                  const isSelected = selectedSeats.some(
                    (selectedSeat) => selectedSeat.id === seat.id
                  );
                  return (
                    <SeatItem3
                      key={index}
                      seat={seat}
                      selected={isSelected}
                      onSelect={selectItem}
                      onUnSelect={unSelectItem}
                    />
                  );
                })}
              </div>
            </div>
          </section>
          {selectedSeats.length > 0 && (
            <section className="column is-one-third-widescreen">
              <div className="card">
                <div className="card-header">
                  <p className="card-header-title">Selected Seats</p>
                </div>
                <div className="card-content has-text-centered">
                  <div className="field">
                    <span className="is-size-5 has-text-success-50 has-text-weight-medium">
                      {UtilLib.toString3(selectedSeats.map((s) => s.number))}
                    </span>
                  </div>
                </div>
                <div className="card-footer is-clipped">
                  <button
                    className="card-footer-item button is-radiusless is-shadowless is-link"
                    onClick={toBookingDetails}
                  >
                    <span className="icon">
                      <Icon path={mdiArrowRightCircle} size={"1.125rem"} />
                    </span>
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </section>
          )}
          <section className="column is-full">
            <div className="fixed-grid has-1-cols-mobile has-4-cols-widescreen">
              <div className="grid">
                {selectedSeats.map((selectedSeat, index) => {
                  const number = selectedSeat.number;
                  const location = UtilLib.toString3(selectedSeat.location);
                  const features =
                    UtilLib.toString3(selectedSeat.features) || "N/A";
                  const extra = selectedSeat.additional || "N/A";
                  return (
                    <div key={index} className="cell">
                      <div className="card">
                        <header className="card-header">
                          <p className="card-header-title">{number}</p>
                          <button
                            className="card-header-icon"
                            aria-label="more options"
                          >
                            <span className="icon">
                              <i
                                className="fas fa-angle-down"
                                aria-hidden="true"
                              ></i>
                            </span>
                          </button>
                        </header>
                        <div className="card-content">
                          <LabelValueDisplay
                            label="Location"
                            value={location}
                          />
                          <LabelValueDisplay
                            label="Features"
                            value={features}
                          />
                          <LabelValueDisplay label="Extra" value={extra} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SeatSelectionPage;

export const getServerSideProps = (async ({ query }) => {
  const tripId = query.tripId;
  try {
    if (!isString(tripId))
      throw new Error(
        "Invalid or missing request query parameter(s): [tripId]."
      );
    const { seats, operator, ...trip } = await prisma.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: { operator: true, seats: { orderBy: { id: "desc" } } },
    });
    const trip2 = JSON.parse(JSON.stringify(trip)) as Trip2;
    return { props: { seats, operator, trip: trip2 } };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{
  seats: Seat[];
  trip: Trip2;
  operator: Operator;
}>;
