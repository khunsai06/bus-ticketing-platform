import { XTripOperation } from "@/constants";
import prisma from "@/lib/prisma-client";
import { PartnerServices } from "@/services/partner";
import { UtilLib } from "@/lib/util";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import React, { type FC, useState, useEffect } from "react";
import { Trip2 } from "@/lib/types";
import { TripStatus } from "@prisma/client";
import moment from "moment";
import { DatetimeLib } from "@/lib/datetime";
import { getCookie, hasCookie } from "cookies-next";

type TripFilterParams = {
  status?: string;
  date?: moment.Moment;
  dl?: string;
  al?: string;
};

const TripsPage = ({
  trips,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [tripList, setTripList] = useState<Trip2[]>(trips);
  const [filterParams, setFilterParams] = useState<TripFilterParams>({});

  useEffect(() => {
    if (
      filterParams.status !== undefined ||
      filterParams.date !== undefined ||
      filterParams.dl !== undefined ||
      filterParams.al !== undefined
    ) {
      reHydrateTripList();
    }
  }, [
    filterParams.status,
    filterParams.date,
    filterParams.dl,
    filterParams.al,
  ]);

  const reHydrateTripList = async () => {
    if (!hasCookie("operatorId")) {
      throw new Error("Missing 'operatorId' cookie for data retrieval.");
    }
    const res = await PartnerServices.TripManager.getMany(
      getCookie("operatorId")!
    );
    UtilLib.handleFetchResponse<Trip2[]>(res, {
      successCallBack(data) {
        const filtered = data.filter((trip) => {
          const dt = moment(trip.departureTime);
          return (
            (!filterParams.status || trip.status === filterParams.status) &&
            (!filterParams.date || dt.isSame(filterParams.date, "day")) &&
            (!filterParams.dl || trip.departureLocation === filterParams.dl) &&
            (!filterParams.al || trip.arrivalLocation === filterParams.al)
          );
        });
        setTripList(filtered);
      },
      errCallback: console.error,
    });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({
      ...prev,
      [name]: name === "date" ? (value ? moment(value) : undefined) : value,
    }));
  };

  return (
    <div>
      <Link href={"/partner/trips/entry"}>Add New Trip</Link>{" "}
      <section>
        <select name="status" onChange={handleFilterChange}>
          <option value={""}>None</option>
          <option value={TripStatus.IDLE}>Idle</option>
          <option value={TripStatus.LAUNCHED}>Launched</option>
          <option value={TripStatus.WITHDRAWN}>Withdraw</option>
        </select>
        <select name="dl" onChange={handleFilterChange}>
          <option value={""}>None</option>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <select name="al" onChange={handleFilterChange}>
          <option value={""}>None</option>
          <option value="Yangon">Yangon</option>
          <option value="Mandalay">Mandalay</option>
          <option value="Lashio">Lashio</option>
        </select>
        <input type="date" name="date" onChange={handleFilterChange} />
      </section>
      <hr />
      <ol>
        {tripList.map((trip, index) => {
          return (
            <TripItem
              key={index}
              trip={trip}
              reHydrateTripList={reHydrateTripList}
            />
          );
        })}
      </ol>
    </div>
  );
};

export default TripsPage;

export const getServerSideProps = (async ({ req }) => {
  const operatorId = getCookie("operatorId", { req });
  if (!hasCookie("operatorId", { req }))
    throw new Error("Missing required cookie(s). [operatorId]");
  const result = await prisma.trip.findMany({
    where: { operatorId },
    orderBy: { id: "desc" },
  });
  return { props: { trips: JSON.parse(JSON.stringify(result)) } };
}) satisfies GetServerSideProps<{ trips: Trip2[] }>;

type TripItemProps = {
  trip: Trip2;
  reHydrateTripList: VoidFunction;
};

const TripItem: FC<TripItemProps> = ({ trip, reHydrateTripList }) => {
  const rt = useRouter();
  const dt = trip.departureTime;
  const at = trip.arrivalTime;

  const edit = () => {
    rt.push(`/partner/trips/entry?ops=edit&id=${trip.id}`);
  };
  const remove = async (id: string) => {
    const res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.DELETE
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };
  const launch = async (id: string) => {
    let res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.LAUNCH
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };

  const withdraw = async (id: string) => {
    let res = await PartnerServices.TripManager.xOperation(
      id,
      XTripOperation.WITHDRAW
    );
    UtilLib.handleFetchResponse(res, {
      successCallBack: reHydrateTripList,
      errCallback: console.error,
    });
  };

  return (
    <li>
      <Link href={`/partner/trips/${trip.id}`}>
        <p>
          {DatetimeLib.extractTimeForDisplay(dt)} - {trip.title}
        </p>
      </Link>
      <p>
        {trip.departureLocation} - {trip.arrivalLocation}
      </p>
      <p>Departs: {DatetimeLib.formatDateForDisplay(dt)}</p>
      <p>
        Arrives: {DatetimeLib.formatDateForDisplay(at)} Duration:{" "}
        {DatetimeLib.getHourDifference(dt, at)} Hours
      </p>
      <p>1 seat x {trip.price} MMK</p>
      <p>{trip.additional}</p>
      <p>Status: {trip.status}</p>
      {trip.status === "IDLE" && (
        <div>
          <button onClick={edit}>Edit</button>{" "}
          <button onClick={() => remove(trip.id)}>Delete</button>{" "}
          <button onClick={() => launch(trip.id)}>Launch</button>{" "}
        </div>
      )}
      {trip.status === "LAUNCHED" && (
        <div>
          <button onClick={() => withdraw(trip.id)}>Withdraw</button>
        </div>
      )}
      {trip.status === "WITHDRAWN" && (
        <div>
          <button onClick={() => remove(trip.id)}>Delete</button>{" "}
        </div>
      )}
      <hr />
    </li>
  );
};
