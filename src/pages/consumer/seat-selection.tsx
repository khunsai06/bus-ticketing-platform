import LabelValueDisplay from "@/components/common/LabelValueDisplay";
import Navbar3 from "@/components/consumer/Navbar3";
import SeatItem3 from "@/components/consumer/SeatItem3";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { Trip2 } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { Operator, Seat } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useState } from "react";
import { isString } from "util";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const SeatSelectionPage: React.FC<Props> = ({ seats, trip, operator }) => {
  const route = trip.departureLocation.concat(" - ", trip.arrivalLocation);
  const stops = UtilLib.toString3(trip.intermediateStops) || "N/A";
  const price = trip.price.toString().concat(" MMK");
  const departAt = DatetimeLib.formatDateForDisplay(trip.departureTime);
  const arriveAt = DatetimeLib.formatDateForDisplay(trip.arrivalTime);
  const placeHolderUrl = "https://placehold.co/144x48";
  const logoUrl = operator.logo || placeHolderUrl;
  const operatorName = UtilLib.capitalize(operator.name);

  const [selectedSeat, setSelectedSeat] = useState<Seat>();
  const selectSeat = (s: Seat) => setSelectedSeat(s);

  return (
    <>
      <Navbar3 />
      <div className="section">
        <div className="columns is-multiline">
          <section className="column">
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
          <section className="column">
            <div className="fixed-grid has-4-cols">
              <div className="grid">
                {seats.map((seat, index) => {
                  return (
                    <SeatItem3
                      key={index}
                      seat={seat}
                      selected={seat.id === selectedSeat?.id}
                      onSelect={selectSeat}
                    />
                  );
                })}
              </div>
            </div>
          </section>
          <section className="column">
            {selectedSeat &&
              (() => {
                const number = selectedSeat.number;
                const location = UtilLib.toString3(selectedSeat.location);
                const features =
                  UtilLib.toString3(selectedSeat.features) || "N/A";
                const extra = selectedSeat.additional || "N/A";
                return (
                  <div className="card">
                    <div className="card-header">
                      <p className="card-header-title">Seat Details</p>
                    </div>
                    <div className="card-content">
                      <LabelValueDisplay label="Number" value={number} />
                      <LabelValueDisplay label="Location" value={location} />
                      <LabelValueDisplay label="Features" value={features} />
                      <LabelValueDisplay label="Extra" value={extra} />
                      <div className="field">
                        <button className="button is-link" disabled>
                          Pick Seat
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </section>
        </div>
      </div>
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
