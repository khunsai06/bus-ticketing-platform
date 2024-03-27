import { OperatorServices } from "@/services/operator";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Trip2, TripEntryPayload } from "@/lib/types";
import { isString } from "@/lib/guards";
import { getCookie, hasCookie } from "cookies-next";
import { DatetimeLib } from "@/lib/datetime";

const NewTripFormPage = ({
  isEditMode,
  trip,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const rt = useRouter();
  const titleVal = isEditMode ? trip!.title : "";
  const depLocVal = isEditMode ? trip!.departureLocation : "";
  const arrLocVal = isEditMode ? trip!.arrivalLocation : "";
  const stopsVal = isEditMode
    ? UtilLib.arrayToCommaSeparatedString(trip!.intermediateStops)
    : "";
  const amensVal = isEditMode
    ? UtilLib.arrayToCommaSeparatedString(trip!.amenities)
    : "";
  const depTimeVal = isEditMode
    ? DatetimeLib.convertIsoToDatetimeLocal(trip!.departureTime)
    : "";
  const arrTimeVal = isEditMode
    ? DatetimeLib.convertIsoToDatetimeLocal(trip!.arrivalTime)
    : "";
  const distanceVal = isEditMode ? Number(trip!.distance ?? 0) : 0;
  const priceVal = isEditMode ? Number(trip!.price ?? 0) : 0;
  const additionalVal = isEditMode ? trip!.additional ?? "" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCookie("operatorId")) {
      throw new Error("Missing 'operatorId' cookie for data entry.");
    }
    const operatorId = getCookie("operatorId")!;
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get("title");
    const departureLocation = fd.get("departureLocation");
    const arrivalLocation = fd.get("arrivalLocation");
    const intermediateStops = fd.get("stops");
    const departureTime = fd.get("departureTime");
    const arrivalTime = fd.get("arrivalTime")!;
    const distance = Number(fd.get("distance"));
    const price = Number(fd.get("price"));
    const amenities = fd.get("amenities");
    const additional = fd.get("additional");
    const data = {
      title,
      departureLocation,
      arrivalLocation,
      intermediateStops,
      departureTime,
      arrivalTime,
      distance,
      price,
      amenities,
      additional,
    };

    if (isEditMode) {
      const res = await OperatorServices.TripManager.update(trip!.id, data);
      UtilLib.handleFetchResponse(res, {
        successCallBack: () => rt.push(`/operator/trips/${trip!.id}`),
        errCallback: console.error,
      });
    } else {
      const res = await OperatorServices.TripManager.create(operatorId, data);
      UtilLib.handleFetchResponse(res, {
        successCallBack: () => rt.push("/operator/trips"),
        errCallback: console.error,
      });
    }
  };
  return (
    <div className="hero is-fullheight p-5" onSubmit={handleSubmit}>
      <form>
        <div>
          <label>Display Name</label>
          <br />
          <input type="text" name="title" defaultValue={titleVal} />
        </div>
        <div>
          <label>Departure Location</label>
          <br />
          <select name="departureLocation" defaultValue={depLocVal}>
            <option value="Yangon">Yangon</option>
            <option value="Mandalay">Mandalay</option>
            <option value="Lashio">Lashio</option>
          </select>
        </div>
        <div>
          <label>Arrival Location</label>
          <br />
          <select name="arrivalLocation" defaultValue={arrLocVal}>
            <option value="Yangon">Yangon</option>
            <option value="Mandalay">Mandalay</option>
            <option value="Lashio">Lashio</option>
          </select>
        </div>
        <div>
          <label>Intermediate Stops</label>
          <br />
          <textarea
            cols={30}
            rows={2}
            name="stops"
            defaultValue={stopsVal}
            placeholder="Enter intermediate stops separated by commas (e.g., foo, bar, baz)"
          />
        </div>
        <div>
          <label>Distance (km)</label> <br />
          <input
            type="number"
            name="distance"
            min={0}
            step={0.01}
            defaultValue={distanceVal}
          />
        </div>
        <div>
          <label>Depart At</label>
          <br />
          <input
            type="datetime-local"
            name="departureTime"
            defaultValue={depTimeVal}
            required
          />
        </div>
        <div>
          <label>Arrive At</label>
          <br />
          <input
            type="datetime-local"
            name="arrivalTime"
            defaultValue={arrTimeVal}
            required
          />
        </div>
        <div>
          <label>Price</label>
          <br />
          <input
            type="number"
            name="price"
            min={0}
            step={0.01}
            defaultValue={priceVal}
          />
        </div>
        <div>
          <label>Amenities</label>
          <br />
          <textarea
            cols={30}
            rows={2}
            name="amenities"
            defaultValue={amensVal}
            placeholder="Enter amenities separated by commas (e.g., foo, bar, baz)"
          />
        </div>
        <div>
          <label>Additional</label>
          <br />
          <textarea
            name="additional"
            cols={30}
            rows={4}
            placeholder="Additional information"
            defaultValue={additionalVal}
          />
        </div>
        <button type="submit">Make a trip</button>
      </form>
      <hr />
    </div>
  );
};

export default NewTripFormPage;

type Props = {
  isEditMode: boolean;
  trip?: Trip2;
};

export const getServerSideProps = (async ({ query }) => {
  const isEditMode = query.ops === "edit";
  const id = query.id;
  if (isEditMode && !isString(id))
    throw new Error("Invalid or missing request query parameter(s): [id].");
  let props: Props = { isEditMode };
  if (isEditMode && isString(id)) {
    const result = await prisma.trip.findUniqueOrThrow({ where: { id } });
    props.trip = JSON.parse(JSON.stringify(result)) as Trip2;
  }
  return { props };
}) satisfies GetServerSideProps<Props>;
