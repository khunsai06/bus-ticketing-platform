import { OperatorServices } from "@/services/operator";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Trip2, TripEntryPayload } from "@/lib/types";
import { getCookie, hasCookie } from "cookies-next";
import { DatetimeLib } from "@/lib/datetime";
import { isString } from "node:util";
import PartnerNavbar from "@/components/operator/Navbar";
import SimpleInput from "@/components/SimpleInput";
import SimpleSelect from "@/components/SimpleSelect";
import cities from "@/cities";
import SimpleTextArea from "@/components/SimpleTextArea";

const NewTripFormPage = ({
  isEditMode,
  trip,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const rt = useRouter();
  const nameVal = isEditMode ? trip!.name : "";
  const depLocVal = isEditMode ? trip!.departureLocation : "";
  const arrLocVal = isEditMode ? trip!.arrivalLocation : "";
  const stopsVal = isEditMode ? UtilLib.toString3(trip!.intermediateStops) : "";
  const amensVal = isEditMode ? UtilLib.toString3(trip!.amenities) : "";
  const depTimeVal = isEditMode
    ? DatetimeLib.convertIsoToDatetimeLocal(trip!.departureTime)
    : "";
  const arrTimeVal = isEditMode
    ? DatetimeLib.convertIsoToDatetimeLocal(trip!.arrivalTime)
    : "";
  const distanceVal = isEditMode ? Number(trip!.distance ?? 0) : "";
  const priceVal = isEditMode ? Number(trip!.price ?? 0) : "";
  const additionalVal = isEditMode ? trip!.additional ?? "" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCookie("operatorId")) {
      throw new Error("Missing 'operatorId' cookie for data entry.");
    }
    const operatorId = getCookie("operatorId")!;
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("name");
    const departureLocation = fd.get("dl");
    const arrivalLocation = fd.get("al");
    const intermediateStops = fd.get("stops");
    const departureTime = fd.get("dt");
    const arrivalTime = fd.get("at")!;
    const distance = Number(fd.get("distance"));
    const price = Number(fd.get("price"));
    const amenities = fd.get("amenities");
    const additional = fd.get("addl");
    const data = {
      name,
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

  const legend = isEditMode
    ? "Trip Route Update and Modification Form"
    : "Bus Operator Route Entry and Schedule Form";
  return (
    <>
      <PartnerNavbar />
      <section className="section">
        <div className="columns is-centered">
          <div className="column is-three-fifths">
            <form onSubmit={handleSubmit}>
              <h4 className="title is-4">{legend}</h4>
              <hr />
              <div className="columns">
                <div className="column">
                  <SimpleInput
                    label={"Display Name*"}
                    type={"text"}
                    name="name"
                    defaultValue={nameVal}
                    required
                  />
                  <div className="field is-grouped mb-0">
                    <SimpleSelect
                      label={"Departure Location*"}
                      name="dl"
                      defaultValue={depLocVal}
                      required
                    >
                      {cities.map((c) => (
                        <option value={c}>{c}</option>
                      ))}
                    </SimpleSelect>
                    <SimpleSelect
                      label={"Arrival Location*"}
                      name="al"
                      defaultValue={arrLocVal}
                      required
                    >
                      {cities.map((c) => (
                        <option value={c}>{c}</option>
                      ))}
                    </SimpleSelect>
                  </div>
                  <SimpleInput
                    label={"Depart At*"}
                    type={"datetime-local"}
                    name="dt"
                    defaultValue={depTimeVal}
                    required
                  />
                  <SimpleInput
                    label={"Arrive At*"}
                    type={"datetime-local"}
                    name="at"
                    defaultValue={arrTimeVal}
                    required
                  />
                  <SimpleInput
                    label={"Price (MMK)*"}
                    type={"text"}
                    inputMode="decimal"
                    name="price"
                    defaultValue={priceVal}
                    required
                  />
                </div>
                <div className="column">
                  <SimpleInput
                    label={"Distance (km)*"}
                    type={"text"}
                    inputMode="decimal"
                    name="distance"
                    defaultValue={distanceVal}
                    required
                  />
                  <SimpleTextArea
                    label={"Intermediate Stops"}
                    cols={30}
                    rows={2}
                    name="stops"
                    defaultValue={stopsVal}
                    placeholder="Enter intermediate stops separated by commas (e.g., foo, bar, baz)"
                  />
                  <SimpleTextArea
                    label={"Amenities"}
                    cols={30}
                    rows={2}
                    name="amenities"
                    defaultValue={amensVal}
                    placeholder="Enter amenities separated by commas (e.g., foo, bar, baz)"
                  />
                  <SimpleTextArea
                    label={"Additional"}
                    cols={30}
                    rows={2}
                    name="addl"
                    defaultValue={additionalVal}
                    placeholder="Additional information"
                  />
                </div>
              </div>
              <hr />
              <div className="buttons is-centered">
                <button
                  className="button"
                  type="reset"
                  onClick={() => rt.replace("/operator/trips")}
                >
                  Cancel
                </button>
                <button className="button is-link" type="submit">
                  Make a trip
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
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
