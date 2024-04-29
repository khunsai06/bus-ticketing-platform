import React, { FC } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminAside from "@/components/admin/Aside";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/lib/prisma-client";
import Icon from "@mdi/react";
import { mdiAccessPoint, mdiChevronDown, mdiOpenInNew } from "@mdi/js";
import Link from "next/link";
import { useRouter } from "next/router";
import { string } from "zod";
import { DatetimeLib } from "@/lib/datetime";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Applications: FC<Props> = ({ apps }) => {
  const rt = useRouter();
  const handleApps = async (appId: string, ops: "approve" | "reject") => {
    try {
      const response = await fetch(
        `/api/admin/x-apps-ops?ops=${ops}&appId=${appId}`,
        {
          method: "POST",
        }
      );
      if (response.ok) rt.reload();
    } catch (error) {
      console.error(error);
    }
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
            <table className="table is-fullwidth">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Company Name</th>
                  <th>Company Email</th>
                  <th>Docs</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, i) => {
                  return (
                    <tr key={i}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>{app.companyName}</td>
                      <td>{app.companyEmail}</td>
                      <td>{DatetimeLib.formatDateForDisplay(app.createdAt)}</td>
                      <td>
                        <div className="buttons are-small is-flex-direction-column is-align-items-start">
                          {app.files.map((f, i) => {
                            const [orgName, newName] = f.split(";");
                            return (
                              <Link
                                key={i}
                                target="_blank"
                                className="button"
                                href={`/uploads/${newName}`}
                              >
                                <span>{orgName} </span>
                                <span className="icon">
                                  <Icon path={mdiOpenInNew} size="1rem" />
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </td>
                      <td className="">
                        <div className="buttons">
                          <button
                            className="button is-small is-success has-text-light"
                            onClick={() => handleApps(app.id, "approve")}
                          >
                            <span>Approve</span>
                          </button>
                          <button
                            className="button is-small is-danger has-text-light"
                            onClick={() => handleApps(app.id, "reject")}
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
export default Applications;

type App = {
  id: string;
  companyName: string;
  companyEmail: string;
  files: string[];
  isApproved: boolean | null;
  isRejected: boolean | null;
  createdAt: string;
};

export const getServerSideProps = (async (ctx) => {
  try {
    const result = await prisma.application.findMany();
    const apps = JSON.parse(JSON.stringify(result)) as App[];
    return {
      props: { apps },
    };
  } catch (error) {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{ apps: App[] }>;
