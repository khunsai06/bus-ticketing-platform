import { ClientErr } from "@/lib/errors";
import prisma from "@/lib/prisma-client";
import { isString, convertIsoToDatetimeLocal } from "@/lib/util";
import { Prisma } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

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
    ? convertIsoToDatetimeLocal(trip!.departureTime)
    : "";
  const arrivalTimeFieldValue = isEditMode
    ? convertIsoToDatetimeLocal(trip!.arrivalTime)
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
    };
    const editUrlSegment = isEditMode ? `?ops=edit&id=${trip!.id}` : "";
    const method = isEditMode ? "PUT" : "POST";
    const res = await fetch(`/api/partner/entry-trip${editUrlSegment}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const parsed = await res.json();
    if (res.ok) {
      rt.push("/partner/trips");
    } else {
      alert(parsed.message);
    }
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

type PrismaReturnTrip = Prisma.PromiseReturnType<
  typeof prisma.trip.findFirstOrThrow
>;
type Trip = Omit<
  PrismaReturnTrip,
  "departureTime" | "arrivalTime" | "price"
> & {
  departureTime: string;
  arrivalTime: string;
  price: number;
};
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
