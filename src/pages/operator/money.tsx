import React, { FC } from "react";
import PartnerNavbar from "@/components/operator/Navbar";
import PartnerAside from "@/components/operator/Aside";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/lib/prisma-client";
import moment from "moment";
import { Booking } from "@prisma/client";
import { isArray } from "util";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Past Month Sales Line Chart",
    },
  },
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Money: FC<Props> = ({ bookingList }) => {
  let totalSale = 0;
  let revenue = 0;
  let totalComm = 0;
  let commPercent = 0;
  let taxPercent = 0;
  let totalTax = 0;
  totalSale = bookingList.reduce(
    (acc, booking) =>
      acc + (booking.totalAmount ? Number(booking.totalAmount) : 0),
    0
  );
  totalComm = bookingList.reduce(
    (acc, booking) =>
      acc +
      (booking.totalAmount
        ? Number(booking.totalAmount) * booking.commissionRate
        : 0),
    0
  );
  totalTax = bookingList.reduce(
    (acc, booking) =>
      acc +
      (booking.totalAmount ? Number(booking.totalAmount) * booking.taxRate : 0),
    0
  );
  revenue = totalSale - totalComm - totalTax;
  taxPercent = totalSale !== 0 ? (totalTax / totalSale) * 100 : 0;
  commPercent = totalSale !== 0 ? (totalComm / totalSale) * 100 : 0;
  const saleDataSets = prepareDataForSale(bookingList);
  const data = {
    labels: Object.keys(saleDataSets),
    datasets: [
      {
        label: "Sale",
        data: Object.values(saleDataSets),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
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
            <div className="fixed-grid has-3-cols">
              <div className="grid">
                <div className="cell">
                  <div className="box">
                    <div className="field">
                      <span className="is-block">Total Sale</span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{totalSale.toFixed(2)}</span>
                        <span> MMK</span>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block">Total Commission</span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{totalComm.toFixed(2)}</span>
                        <span> MMK</span>
                      </span>
                      <span className="is-italic has-text-danger">
                        <sub> {commPercent.toFixed(2)}%</sub>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block">Total Tax</span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{totalTax.toFixed(2)}</span>
                        <span> MMK</span>
                      </span>
                      <span className="is-italic has-text-danger">
                        <sub> {taxPercent.toFixed(2)}%</sub>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block">Revenue</span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{revenue.toFixed(2)}</span>
                        <span> MMK</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cell is-col-span-2">
                  <div className="box">
                    <Line options={options} data={data} />
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
export default Money;

export const getServerSideProps = (async (ctx) => {
  const result = await prisma.booking.findMany({
    where: { isCanceled: false },
    orderBy: { bookedAt: "desc" },
  });
  const bookingList = JSON.parse(JSON.stringify(result)) as typeof result;
  console.log(bookingList);

  return { props: { bookingList } };
}) satisfies GetServerSideProps<{}>;

function prepareDataForSale(bookingList: Booking[]): {
  [key: string]: number;
} {
  const monthlySum: { [key: string]: number } = {};

  bookingList.forEach(({ bookedAt, totalAmount }) => {
    const monthKey = moment(bookedAt).format("YYYY-MM");
    if (!monthlySum[monthKey]) {
      monthlySum[monthKey] = 0;
    }
    monthlySum[monthKey] += Number(totalAmount);
  });

  return monthlySum;
}
