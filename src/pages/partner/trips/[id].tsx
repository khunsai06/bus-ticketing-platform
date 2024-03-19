import { XSeatOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import { Seat } from "@/lib/types";
import { handleFetchResponse } from "@/lib/util";
import { PartnerServices } from "@/services/partner";
import { Prisma } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { type FC, useState } from "react";

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

const SeatItem: FC<{ seat: Seat }> = ({ seat }) => {
  const [isAvailable, setIsAvailable] = useState(seat.isAvailable);
  const seatAvailabilityToggler = async () => {
    const operation = isAvailable ? XSeatOperation.LOCK : XSeatOperation.OPEN;
    const res = await PartnerServices.SeatManager.xOperation(
      seat.id,
      operation
    );
    handleFetchResponse(res, {
      successCallBack: () => {
        setIsAvailable(!isAvailable);
      },
      errCallback: console.error,
    });
  };
  return (
    <li>
      <p>
        Identifier: {seat.identifier} Status:{" "}
        {isAvailable ? "FREE" : "RESERVED"}{" "}
        <button onClick={seatAvailabilityToggler}>
          {isAvailable ? "Lock" : "Open"}
        </button>{" "}
      </p>
    </li>
  );
};
