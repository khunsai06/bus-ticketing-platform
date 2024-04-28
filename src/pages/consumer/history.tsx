import LabelValueDisplay from "@/components/common/LabelValueDisplay";
import ConsumerNavbar from "@/components/consumer/Navbar";
import { DatetimeLib } from "@/lib/datetime";
import prisma from "@/lib/prisma-client";
import { UtilLib } from "@/lib/util";
import { Booking, Consumer, Seat } from "@prisma/client";
import { getCookie } from "cookies-next";
import moment from "moment";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import React, { FC } from "react";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const history: FC<Props> = ({ bookingList, refundTimeFrame }) => {
  const rt = useRouter();

  return (
    <>
      <ConsumerNavbar />
      <main
        className="section has-background-white-bis"
        style={{ minHeight: "calc(100vh - 51px)" }}
      >
        <div className="columns">
          <div className="column">
            <div className="fixed-grid has-1-cols-mobile has-3-cols-widescreen">
              <div className="grid">
                {bookingList.map((booking, i) => {
                  const seatList = booking.BookedSeat.map((s) => s.Seat);
                  if (seatList.length > 0) {
                    const trip = seatList[0].Trip;
                    const operator = trip.Operator;
                    const route = trip.departureLocation.concat(
                      " - ",
                      trip.arrivalLocation
                    );
                    const depTime = DatetimeLib.formatDateForDisplay(
                      trip.departureTime.toString()
                    );
                    const bookedAt = DatetimeLib.formatDateForDisplay(
                      booking.bookedAt.toString()
                    );
                    const { hours, minutes } =
                      DatetimeLib.calculateCancellationTime(
                        booking.bookedAt.toString(),
                        refundTimeFrame
                      );
                    const left = `${hours} hours ${minutes} minutes left`;
                    const left2 = `Time left for cancellation: ${hours} hours and ${minutes} minutes.`;
                    return (
                      <div className="cell" key={i}>
                        <div
                          className="box is-clickable"
                          onClick={() =>
                            rt.push(
                              `/consumer/booking-details?bookingId=${booking.id}`
                            )
                          }
                        >
                          <div className="field">
                            <div className="tags">
                              <span className="tag is-link is-light">
                                {booking.isCanceled ? "Canceled" : "Booked"}
                              </span>
                            </div>
                          </div>
                          <LabelValueDisplay
                            label={"Bus Operator"}
                            value={operator.name}
                          />
                          <LabelValueDisplay label={"Route"} value={route} />
                          <LabelValueDisplay
                            label={"Depart at"}
                            value={depTime}
                          />
                          <LabelValueDisplay
                            label={"Booked at"}
                            value={bookedAt}
                          />
                          <LabelValueDisplay
                            label={"Seat are"}
                            value={UtilLib.toString3(
                              seatList.map((seat) => seat.number)
                            )}
                          />
                          {moment(booking.bookedAt).minutes() > 0 &&
                            !booking.isCanceled && (
                              <article className="message is-danger">
                                <div className="message-body">{left2}</div>
                              </article>
                            )}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer"></footer>
    </>
  );
};

export default history;

export const getServerSideProps = (async ({ req }) => {
  const consumerId = getCookie("consumerId", { req })!;
  const { refundTimeFrame } = await prisma.settings.findFirstOrThrow({
    orderBy: { createdAt: "desc" },
  });
  const result = await prisma.booking.findMany({
    where: { consumerId },
    orderBy: { bookedAt: "desc" },
    include: {
      BookedSeat: {
        include: {
          Seat: { include: { Trip: { include: { Operator: true } } } },
        },
      },
    },
  });
  const bookingList = JSON.parse(JSON.stringify(result)) as typeof result;
  return {
    props: { bookingList, refundTimeFrame },
  };
}) satisfies GetServerSideProps<{}>;
