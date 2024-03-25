import { PartnerServices } from "@/services/partner";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Trip2 } from "@/lib/types";
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
  const interStopsVal = isEditMode ? trip!.intermediateStops ?? "" : "";
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
    const departureLocation = fd.get("departureLocation")!;
    const arrivalLocation = fd.get("arrivalLocation")!;
    const intermediateStops = fd.get("stops");
    const departureTime = fd.get("departureTime");
    const arrivalTime = fd.get("arrivalTime");
    const distance = Number(fd.get("distance"));
    const price = Number(fd.get("price"));
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
      additional,
    };
    let res: Response;
    if (isEditMode) {
      res = await PartnerServices.TripManager.update(trip!.id, data);
    } else {
      res = await PartnerServices.TripManager.create(operatorId, data);
    }
    UtilLib.handleFetchResponse(res, {
      successCallBack: () => rt.push("/partner/trips"),
      errCallback: console.error,
    });
  };
  return (
    <div className="hero is-fullheight p-5" onSubmit={handleSubmit}>
      <form>
        <input type="text" name="title" defaultValue={titleVal} />
        <br />
        <select name="departureLocation" defaultValue={depLocVal}>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <br />
        <select name="arrivalLocation" defaultValue={arrLocVal}>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <br />
        <input
          type="text"
          name="stops"
          placeholder="intermediate stops"
          defaultValue={interStopsVal}
        />
        <br />
        <input
          type="number"
          name="distance"
          min={0}
          step={0.01}
          defaultValue={distanceVal}
        />
        <br />
        <input
          type="datetime-local"
          name="departureTime"
          defaultValue={depTimeVal}
          required
        />
        <br />
        <input
          type="datetime-local"
          name="arrivalTime"
          defaultValue={arrTimeVal}
          required
        />
        <br />
        <input
          type="number"
          name="price"
          min={0}
          step={0.01}
          defaultValue={priceVal}
        />
        <br />
        <textarea
          name="additional"
          cols={30}
          rows={4}
          placeholder="Additional information"
          defaultValue={additionalVal}
        />
        <br />
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
