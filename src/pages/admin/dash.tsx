import React, { FC } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminAside from "@/components/admin/Aside";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ArcElement,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Credential } from "@prisma/client";
import prisma from "@/lib/prisma-client";
import moment from "moment";
import { da } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const options1 = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Monthly Consumer Enrollment Trends.",
    },
  },
};
const options2 = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Monthly Operator Enrollment Trends",
    },
  },
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Dashboard: FC<Props> = ({
  consumerData,
  operatorData,
  consumerCount,
  partnerCount,
  appCount,
}) => {
  const lineData1 = {
    labels: getMonths(consumerData),
    datasets: [
      {
        label: "Consumer",
        data: getCounts(consumerData),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
  const lineData2 = {
    labels: getMonths(operatorData),
    datasets: [
      {
        label: "Operator",
        data: getCounts(operatorData),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
  return (
    <>
      <AdminNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <AdminAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="fixed-grid has-12-cols">
              <div className="grid">
                <div className="cell is-col-span-6">
                  <div className="box">
                    <Line options={options1} data={lineData1} />
                  </div>
                </div>
                <div className="cell is-col-span-6">
                  <div className="box">
                    <Line options={options2} data={lineData2} />
                  </div>
                </div>
                <div className="cell is-col-span-4">
                  <div className="box">
                    <div className="field">
                      <span className="is-block has-text-weight-medium">
                        Total Consumer Count
                      </span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{consumerCount}</span>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block has-text-weight-medium">
                        Total Partner Count
                      </span>
                      <span className="is-size-4 has-text-success-50 has-text-weight-medium">
                        <span>{partnerCount}</span>
                      </span>
                    </div>
                    <div className="field">
                      <span className="is-block has-text-weight-medium">
                        Pending Applications
                      </span>
                      <span className="is-size-4 has-text-danger-50 has-text-weight-medium">
                        <span>{appCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* <div className="cell is-col-span-4">
                  <div className="box">
                    <Pie data={pieData} />
                  </div>
                </div> */}
                {/* <div className="cell is-col-span-6">
                  <div className="box">
                    <Bar data={barData} />
                  </div>
                </div> */}
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
  const result1 = await prisma.credential.findMany({
    where: { userType: "OPERATOR" },
  });
  const result2 = await prisma.credential.findMany({
    where: { userType: "CONSUMER" },
  });
  const result3 = await prisma.application.findMany();
  const operatorData = groupItemByMonth(result1);
  const consumerData = groupItemByMonth(result2);
  const consumerCount = result1.length;
  const partnerCount = result2.length;
  const appCount = result3.length;
  return {
    props: {
      operatorData,
      consumerData,
      consumerCount,
      partnerCount,
      appCount,
    },
  };
}) satisfies GetServerSideProps<{}>;

function getMonths(operatorData: MonthCount[]): string[] {
  return operatorData.map((data) => moment.months(data.month));
}

function getCounts(operatorData: MonthCount[]): number[] {
  return operatorData.map((data) => data.count);
}

interface MonthCount {
  month: number;
  count: number;
}
function groupItemByMonth(credentials: Credential[]): MonthCount[] {
  const monthCounts: { [key: number]: number } = {};

  credentials.forEach((credential) => {
    const createdAt = new Date(credential.createdAt);
    const month = createdAt.getMonth() + 1; // JavaScript months are zero-based

    if (monthCounts[month]) {
      monthCounts[month]++;
    } else {
      monthCounts[month] = 1;
    }
  });

  const result: MonthCount[] = Object.keys(monthCounts).map((month) => ({
    month: parseInt(month),
    count: monthCounts[parseInt(month)],
  }));

  return result;
}

const pieData = {
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

const barData = {
  labels: [],
  datasets: [
    {
      label: "Cancellation",
      data: [],
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Booking",
      data: [],
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};
