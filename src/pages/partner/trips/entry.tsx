import { PartnerServices } from "@/services/partner";
import prisma from "@/lib/prisma-client";
import { Utilities, handleFetchResponse, isString } from "@/lib/util";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Trip } from "@/lib/types";

const NewTripFormPage = ({
  isEditMode,
  trip,
  seatCapacity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const rt = useRouter();
  const titleFieldValue = isEditMode ? trip!.title : "";
  const departureLocationFieldValue = isEditMode ? trip!.departureLocation : "";
  const arrivalLocationFieldValue = isEditMode ? trip!.arrivalLocation : "";
  const intermediateStopsFieldValue = isEditMode
    ? trip!.intermediateStops ?? ""
    : "";
  const departureTimeFieldValue = isEditMode
    ? Utilities.Datetime.convertIsoToDatetimeLocal(trip!.departureTime)
    : "";
  const arrivalTimeFieldValue = isEditMode
    ? Utilities.Datetime.convertIsoToDatetimeLocal(trip!.arrivalTime)
    : "";
  const priceFieldValue = isEditMode ? Number(trip!.price) : 0;
  const additionalFieldValue = isEditMode ? trip!.additional ?? "" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get("title");
    const departureLocation = fd.get("departureLocation");
    const arrivalLocation = fd.get("arrivalLocation");
    const intermediateStops = fd.get("stops");
    const departureTime = fd.get("departureTime");
    const arrivalTime = fd.get("arrivalTime");
    const price = Number(fd.get("price"));
    const seatCapacity = Number(fd.get("seatCapacity"));
    const additional = fd.get("additional");
    const operatorId = "foo";
    const data = {
      title,
      departureLocation,
      arrivalLocation,
      intermediateStops,
      departureTime,
      arrivalTime,
      price,
      seatCapacity,
      additional,
      operatorId,
    };
    let res: Response;
    if (isEditMode) {
      res = await PartnerServices.TripManager.update(trip!.id, data);
    } else {
      res = await PartnerServices.TripManager.create(data);
    }
    handleFetchResponse(res, {
      successCallBack: () => rt.push("/partner/trips"),
      errCallback: console.error,
    });
  };
  return (
    <div className="hero is-fullheight p-5" onSubmit={handleSubmit}>
      <form>
        <input type="text" name="title" defaultValue={titleFieldValue} />
        <br />
        <select
          name="departureLocation"
          defaultValue={departureLocationFieldValue}
        >
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <br />
        <select name="arrivalLocation" defaultValue={arrivalLocationFieldValue}>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <br />
        <input
          type="text"
          name="stops"
          placeholder="intermediate stops"
          defaultValue={intermediateStopsFieldValue}
        />
        <br />
        <input
          type="datetime-local"
          name="departureTime"
          defaultValue={departureTimeFieldValue}
          required
        />
        <br />
        <input
          type="datetime-local"
          name="arrivalTime"
          defaultValue={arrivalTimeFieldValue}
          required
        />
        <br />
        <select name="seatCapacity" defaultValue={seatCapacity}>
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={18}>18</option>
          <option value={24}>24</option>
        </select>
        <br />
        <input
          type="number"
          name="price"
          min={0}
          step={0.01}
          defaultValue={priceFieldValue}
        />
        <br />
        <textarea
          name="additional"
          cols={30}
          rows={4}
          placeholder="Additional information"
          defaultValue={additionalFieldValue}
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
  trip?: Trip;
  seatCapacity?: number;
};

export const getServerSideProps = (async (ctx) => {
  const isEditMode = ctx.query.ops === "edit" && isString(ctx.query.id);
  let props: Props = { isEditMode };
  if (isEditMode) {
    const prismaReturnTrip = await prisma.trip.findUniqueOrThrow({
      where: { id: ctx.query.id as string },
      include: { seats: true },
    });
    props.trip = JSON.parse(JSON.stringify(prismaReturnTrip)) as Trip;
    props.seatCapacity = prismaReturnTrip.seats.length;
  }
  return {
    props,
  };
}) satisfies GetServerSideProps<Props>;
