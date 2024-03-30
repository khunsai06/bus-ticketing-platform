import { DatetimeLib } from "@/lib/datetime";
import { Trip4 } from "@/lib/types";
import React from "react";
import LabelValueDisplay from "../common/LabelValueDisplay";
import { UtilLib } from "@/lib/util";
import { useRouter } from "next/router";

const TripItem3: React.FC<{ trip: Trip4 }> = ({ trip }) => {
  const rt = useRouter();
  const name = UtilLib.capitalize(trip.name);
  const route = trip.departureLocation.concat(" - ", trip.arrivalLocation);
  const stops = UtilLib.toString3(trip.intermediateStops) || "N/A";
  const amenities = UtilLib.toString3(trip.amenities) || "N/A";
  const price = trip.price.toString().concat(" MMK");
  const departAt = DatetimeLib.formatDateForDisplay(trip.departureTime);
  const arriveAt = DatetimeLib.formatDateForDisplay(trip.arrivalTime);
  const estimateDuration = DatetimeLib.getHourDifference(
    trip.departureTime,
    trip.arrivalTime
  )
    .toString()
    .concat(" Hours");
  const placeHolderUrl = "https://placehold.co/144x48";
  const logoUrl = trip.operator.logo || placeHolderUrl;
  const note = trip.additional || "N/A";
  const operatorName = UtilLib.capitalize(trip.operator.name);
  const availableSeats = trip.seats.filter((s) => s.status == "FREE");
  const availableSeatsCount = availableSeats.length;

  const goToSeatSelection = () =>
    rt.push(`/consumer/seat-selection?tripId=${trip.id}`);

  return (
    <li className="field">
      <div className="box">
        <div className="columns is-vcentered">
          <div className="column">
            <h6 className="title is-6">{name}</h6>
            <LabelValueDisplay label="Route" value={route} />
            <LabelValueDisplay label="Intermediate Stops" value={stops} />
            <LabelValueDisplay label="Depart At" value={departAt} />
            <LabelValueDisplay label="Arrive At" value={arriveAt} />
            <LabelValueDisplay label="Estimate" value={estimateDuration} />
            <LabelValueDisplay label="Amenities" value={amenities} />
            <LabelValueDisplay label="Note" value={note} />
          </div>
          <div className="column is-one-fifth">
            <h6 className="subtitle is-6">{operatorName}</h6>
            <img src={logoUrl} />
          </div>
          <div className="column is-one-fifth">
            <div className="field">
              <span className="has-text-weight-medium">
                Seat Availability:{" "}
              </span>
              <span className="is-size-5 has-text-weight-medium has-text-danger-50">
                {availableSeatsCount}
              </span>
            </div>
            <div className="field">
              <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                {price}
              </span>
              <span className="is-italic">
                <sub> per seat</sub>
              </span>
            </div>
            <div className="field buttons">
              <button className="button is-link" onClick={goToSeatSelection}>
                Select Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default TripItem3;
