import { DatetimeLib } from "@/lib/datetime";
import { Trip2 } from "@/lib/types";
import { useRouter } from "next/router";
import { FC } from "react";

const TripItem2: FC<{ trip: Trip2 }> = ({ trip }) => {
  const rt = useRouter();
  const detailUrl = `/operator/trips/${trip.id}`;
  const goToDetails = () => rt.push(detailUrl);
  return (
    <tr onClick={goToDetails} style={{ cursor: "pointer" }}>
      <td>{trip.title}</td>
      <td>{trip.departureLocation}</td>
      <td>{trip.arrivalLocation}</td>
      <td>{DatetimeLib.formatDateForDisplay(trip.departureTime)}</td>
      <td>{trip.status}</td>
    </tr>
  );
};

export default TripItem2;
