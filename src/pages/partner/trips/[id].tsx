import { XSeatOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import { Seat } from "@/lib/types";
import { UtilLib } from "@/lib/util";
import { PartnerServices } from "@/services/partner";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { type FC, useState, useEffect } from "react";

const TripDetails = ({
  seats,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [seatList, setSeatList] = useState<Seat[]>([]);

  useEffect(() => {
    setSeatList(seats);
  }, []);

  const reHydrateSeatList = async () => {
    const res = await PartnerServices.SeatManager.getMany(seats[0].tripId);
    UtilLib.handleFetchResponse<Seat[]>(res, {
      successCallBack: setSeatList,
      errCallback: console.error,
    });
  };

  return (
    <div>
      <ul>
        {seatList.map((seat, index) => {
          return (
            <SeatItem
              key={index}
              seat={seat}
              reHydrateSeatList={reHydrateSeatList}
            />
          );
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

const SeatItem: FC<{ seat: Seat; reHydrateSeatList: VoidFunction }> = ({
  seat,
  reHydrateSeatList,
}) => {
  const seatAvailabilityToggler = async () => {
    const operation = seat.isAvailable
      ? XSeatOperation.LOCK
      : XSeatOperation.OPEN;
    const res = await PartnerServices.SeatManager.xOperation(
      seat.id,
      operation
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: reHydrateSeatList,
      errCallback: console.error,
    });
  };
  return (
    <li>
      <p>
        Identifier: {seat.identifier} Status:{" "}
        {seat.isAvailable ? "FREE" : "RESERVED"}{" "}
        <button onClick={seatAvailabilityToggler}>
          {seat.isAvailable ? "Lock" : "Open"}
        </button>{" "}
      </p>
    </li>
  );
};
