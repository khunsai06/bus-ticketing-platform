import { XSeatOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import { Prisma } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { type FC, useState } from "react";

type Seat = Prisma.PromiseReturnType<typeof prisma.seat.findUniqueOrThrow>;

const TripDetails = ({
  seats,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <ul>
        {seats.map((seat, index) => {
          return <SeatItem key={index} seat={seat} />;
        })}
      </ul>
    </div>
  );
};

export default TripDetails;

export const getServerSideProps = (async (ctx) => {
  const { id } = ctx.query;
  const seats = await prisma.seat.findMany({
    where: { tripId: id as string },
    orderBy: { id: "asc" },
  });
  return {
    props: { seats },
  };
}) satisfies GetServerSideProps<{ seats: Seat[] }>;

const xSeatOperation = async (id: string, ops: XSeatOperation) => {
  return await fetch(`/api/partner/x-seat-ops?id=${id}&ops=${ops.toString()}`, {
    method: "PATCH",
  });
};

const SeatItem: FC<{ seat: Seat }> = ({ seat }) => {
  const [isAvailable, setIsAvailable] = useState(seat.isAvailable);
  const seatAvailabilityToggler = async () => {
    const operation = isAvailable ? XSeatOperation.lock : XSeatOperation.open;
    const res = await xSeatOperation(seat.id, operation);
    if (res.ok) {
      setIsAvailable(!isAvailable);
    }
  };
  return (
    <li>
      <p>
        Identifier: {seat.identifier} Status:{" "}
        {isAvailable ? "FREE" : "RESERVED"}{" "}
        <button onClick={seatAvailabilityToggler}>
          {isAvailable ? "LOCK" : "OPEN"}
        </button>{" "}
      </p>
    </li>
  );
};
