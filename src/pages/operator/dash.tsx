import React, { FC } from "react";
import PartnerNavbar from "@/components/operator/Navbar";
import PartnerAside from "@/components/operator/Aside";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ArcElement,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/lib/prisma-client";
import { Booking } from "@prisma/client";
import moment from "moment";

ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["Yangon", "Mandalay", "Naypyidaw", "Bago", "Mawlamyine", "Taunggyi"],
  datasets: [
    {
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Dashboard: FC<Props> = ({ bookingAndCancelCounts }) => {
  const barChartData = {
    labels: Object.keys(bookingAndCancelCounts),
    datasets: [
      {
        label: "Cancellation",
        data: Object.values(bookingAndCancelCounts).map((v) => v.cancel_count),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Booking",
        data: Object.values(bookingAndCancelCounts).map((v) => v.booking_count),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
  return (
    <>
      <PartnerNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <PartnerAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="fixed-grid has-12-cols">
              <div className="grid">
                <div className="cell is-col-span-4">
                  <div className="box">
                    <Pie
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                          title: {
                            display: true,
                            text: "Most Popular Travel Destinations Pie Chart",
                          },
                        },
                      }}
                      data={data}
                    />
                  </div>
                </div>
                <div className="cell is-col-span-8">
                  <div className="box">
                    <Bar
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                          title: {
                            display: true,
                            text: "Bookings vs. Cancellations Bar Chart",
                          },
                        },
                      }}
                      data={barChartData}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;

export const getServerSideProps = (async (ctx) => {
  const result = await prisma.booking.findMany();
  const bookingAndCancelCounts = getBookingAndCancelCounts(result);
  return {
    props: { bookingAndCancelCounts },
  };
}) satisfies GetServerSideProps<{}>;
interface CountsByMonth {
  [month: string]: { booking_count: number; cancel_count: number };
}

function getBookingAndCancelCounts(bookings: Booking[]) {
  const countsByMonth: CountsByMonth = {};

  bookings.forEach((booking) => {
    const month = moment(booking.bookedAt).format("YYYY-MM");
    if (!countsByMonth[month]) {
      countsByMonth[month] = { booking_count: 0, cancel_count: 0 };
    }
    if (!booking.isCanceled) {
      countsByMonth[month].booking_count++;
    } else {
      countsByMonth[month].cancel_count++;
    }
  });

  return countsByMonth;
}
