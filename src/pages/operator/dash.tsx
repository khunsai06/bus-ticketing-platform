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
import { getCookie } from "cookies-next";
import { isString } from "util";

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
const Dashboard: FC<Props> = ({
  bookingAndCancelCounts,
  topDepData,
  topArrData,
  totalCancelCount,
  totalBookingCount,
  todayPassengerCount,
}) => {
  const pieData1 = {
    labels: topArrData.map((i) => i.location),
    datasets: [
      {
        data: topArrData.map((i) => i.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const pieData2 = {
    labels: topDepData.map((i) => i.location),
    datasets: [
      {
        data: topDepData.map((i) => i.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
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
                <div className="cell is-col-span-3">
                  <div className="box">
                    <div className="field">
                      <span className="is-block has-text-weight-medium">
                        Total Booking Count
                      </span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{totalBookingCount}</span>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block has-text-weight-medium">
                        Total Cancelation Count
                      </span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{totalCancelCount}</span>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block has-text-weight-medium">
                        Today Passenger Count
                      </span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{todayPassengerCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cell is-col-span-6">
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
                            text: "Bookings vs Cancellations",
                          },
                        },
                      }}
                      data={barChartData}
                    />
                  </div>
                </div>

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
                            text: "Top 5 Popular Travel Destinations",
                          },
                        },
                      }}
                      data={pieData1}
                    />
                  </div>
                </div>
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
                            text: "Top 5 Departure Origins",
                          },
                        },
                      }}
                      data={pieData2}
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

export const getServerSideProps = (async ({ req }) => {
  const operatorId = getCookie("operatorId", { req });
  if (!isString(operatorId)) return { notFound: true };
  const result = await prisma.booking.findMany();
  const bookingAndCancelCounts = getBookingAndCancelCounts(result);
  const topDepData = await getTopDepartureLocationsWithCount();
  const topArrData = await getTopArrivalLocationsWithCount();
  const totalCancelCount = await prisma.booking.count({
    where: {
      isCanceled: true,
      BookedSeat: { some: { Seat: { Trip: { operatorId } } } },
    },
  });
  const totalBookingCount = await prisma.booking.count({
    where: {
      BookedSeat: { some: { Seat: { Trip: { operatorId } } } },
    },
  });
  const startDate = moment().toDate();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);
  const todayPassengerCount = await prisma.booking.count({
    where: {
      BookedSeat: {
        some: {
          Seat: {
            Trip: {
              operatorId,
              departureTime: {
                gte: startDate,
                lt: endDate,
              },
            },
          },
        },
      },
    },
  });

  return {
    props: {
      bookingAndCancelCounts,
      topDepData,
      topArrData,
      totalCancelCount,
      totalBookingCount,
      todayPassengerCount,
    },
  };
}) satisfies GetServerSideProps<{}>;
interface CountsByMonth {
  [month: string]: { booking_count: number; cancel_count: number };
}

interface DepartureLocationWithCount {
  location: string;
  count: number;
}

async function getTopDepartureLocationsWithCount(): Promise<
  DepartureLocationWithCount[]
> {
  try {
    // Step 1: Query all trips along with their departure locations
    const trips = await prisma.trip.findMany({
      select: { departureLocation: true },
      distinct: ["departureLocation"],
    });

    // Step 2: Count the number of bookings for each departure location
    const departureLocationsCount: Record<string, number> = {};
    for (const trip of trips) {
      const count = await prisma.booking.count({
        where: {
          BookedSeat: {
            some: {
              Seat: { Trip: { departureLocation: trip.departureLocation } },
            },
          },
        },
      });
      departureLocationsCount[trip.departureLocation] = count;
    }

    // Step 3: Map departure locations to objects containing location and count
    const departureLocationsWithCount: DepartureLocationWithCount[] =
      Object.entries(departureLocationsCount).map(([location, count]) => ({
        location,
        count,
      }));

    // Step 4: Sort the departure locations based on the count in descending order
    departureLocationsWithCount.sort((a, b) => b.count - a.count);

    // Step 5: Take the top 5 departure locations
    const top5DepartureLocations = departureLocationsWithCount.slice(0, 5);

    return top5DepartureLocations;
  } catch (error) {
    throw new Error(`Error fetching top departure locations: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

interface ArrivalLocationWithCount {
  location: string;
  count: number;
}

async function getTopArrivalLocationsWithCount(): Promise<
  ArrivalLocationWithCount[]
> {
  try {
    // Step 1: Query all trips along with their arrival locations
    const trips = await prisma.trip.findMany({
      select: { arrivalLocation: true },
      distinct: ["arrivalLocation"],
    });

    // Step 2: Count the number of bookings for each arrival location
    const arrivalLocationsCount: Record<string, number> = {};
    for (const trip of trips) {
      const count = await prisma.booking.count({
        where: {
          BookedSeat: {
            some: {
              Seat: { Trip: { arrivalLocation: trip.arrivalLocation } },
            },
          },
        },
      });
      arrivalLocationsCount[trip.arrivalLocation] = count;
    }

    // Step 3: Map arrival locations to objects containing location and count
    const arrivalLocationsWithCount: ArrivalLocationWithCount[] =
      Object.entries(arrivalLocationsCount).map(([location, count]) => ({
        location,
        count,
      }));

    // Step 4: Sort the arrival locations based on the count in descending order
    arrivalLocationsWithCount.sort((a, b) => b.count - a.count);

    // Step 5: Take the top 5 arrival locations
    const top5ArrivalLocations = arrivalLocationsWithCount.slice(0, 5);

    return top5ArrivalLocations;
  } catch (error) {
    throw new Error(`Error fetching top arrival locations: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
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
