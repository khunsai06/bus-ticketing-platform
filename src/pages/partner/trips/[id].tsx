import { XSeatOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import { Prisma } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { type FC, useState } from "react";

type Seats = Prisma.PromiseReturnType<typeof prisma.seat.findMany>;

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
}) satisfies GetServerSideProps<{ seats: Seats }>;

const xSeatOperation = async (id: string, ops: XSeatOperation) => {
  return await fetch(`/api/partner/x-seat-ops?id=${id}&ops=${ops.toString()}`, {
    method: "PATCH",
  });
};

type SeatItemProps = {
  seat: Seats[0];
};

const SeatItem: FC<SeatItemProps> = ({ seat }) => {
  const [isAvailable, setIsAvailable] = useState(seat.isAvailable);
  return (
    <li>
      <p>
        Identifier: {seat.identifier} Status:{" "}
        {isAvailable ? "free" : "reserved"}{" "}
        <button
          onClick={async () => {
            const operation = isAvailable
              ? XSeatOperation.lock
              : XSeatOperation.open;
            const res = await xSeatOperation(seat.id, operation);
            if (res.ok) {
              setIsAvailable(!isAvailable);
            }
          }}
        >
          {isAvailable ? "lock" : "open"}
        </button>{" "}
      </p>
    </li>
  );
};
