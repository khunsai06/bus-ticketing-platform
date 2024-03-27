import { DatetimeLib } from "@/lib/datetime";
import { Trip3 } from "@/lib/types";
import Link from "next/link";
import React from "react";

const TripItem3: React.FC<{ trip: Trip3 }> = ({ trip }) => {
  const departureDatetime = DatetimeLib.formatDateForDisplay(
    trip.departureTime
  );
  const arrivalDatetime = DatetimeLib.formatDateForDisplay(trip.arrivalTime);
  const estimateDuration = DatetimeLib.getHourDifference(
    trip.departureTime,
    trip.arrivalTime
  );
  const placeHolderUrl = "https://placehold.co/160x54";
  const logoUrl = trip.operator.logo || placeHolderUrl;
  return (
    <li>
      <Link href={`/consumer/trips/${trip.id}`}>
        <p>
          {departureDatetime} - {trip.title}
        </p>
      </Link>
      <h4>{trip.operator.name}</h4>
      <img src={logoUrl} />
      <p>
        {trip.departureLocation} - {trip.arrivalLocation}
      </p>
      <p>Departs: {departureDatetime}</p>
      <p>
        Arrives: {arrivalDatetime} Duration: {estimateDuration} Hours
      </p>
      <p>1 seat x {trip.price} MMK</p>
      <p>{trip.additional}</p>
    </li>
  );
};

export default TripItem3;
