import React, { FC } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminAside from "@/components/admin/Aside";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/lib/prisma-client";
import { DatetimeLib } from "@/lib/datetime";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import AccountEntryDialog from "@/components/consumer/AccountEntryDialog";
import useSwitch from "@/hooks/useSwitch";
import { useRouter } from "next/router";
import { Credential } from "@prisma/client";
import { HttpVerb } from "@/constants";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Dashboard: FC<Props> = ({ userList }) => {
  const dialogSwitch = useSwitch();
  const rt = useRouter();
  const refresh = () => rt.reload();
  const [thatUser, setThatUser] = React.useState<Credential>();
  const deleteUser = async (cid: string, role: string) => {
    const title = "Confirmation: Delete User Account";
    const message =
      "Are you sure you want to delete your user account? This action is irreversible and all associated data, including profile information and activity history, will be permanently removed from our system.";
    const canDelete = confirm(message);
    try {
      if (!canDelete) return;
      const res = await fetch(
        `/api/admin/x-users-ops?cid=${cid}&role=${role}`,
        {
          method: HttpVerb.DELETE,
        }
      );
      if (res.ok) return rt.reload();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <AdminNavbar />
      <AccountEntryDialog
        active={dialogSwitch.value}
        closeDialog={dialogSwitch.close}
        refresh={refresh}
        user={thatUser}
      />
      {/* <button
        onClick={dialogSwitch.toggle}
        className="button is-link is-large"
        style={{ position: "fixed", zIndex: 100, right: 48, bottom: 48 }}
      >
        <span className="icon">
          <Icon path={mdiPlus} size={1} />
        </span>
      </button> */}
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <AdminAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="table-container card is-radiusless">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
                    </th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((user, i) => {
                    return (
                      <tr key={i}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>{user.email || "N/A"}</td>
                        <td>{user.uname || "N/A"}</td>
                        <td>
                          <div className="tag is-link is-light is-uppercase">
                            {user.userType}
                          </div>
                        </td>
                        <td>
                          {DatetimeLib.formatDateForDisplay(
                            user.createdAt.toString()
                          )}
                        </td>
                        <td>
                          <div className="buttons are-small">
                            <button
                              className="button is-link"
                              onClick={() => {
                                setThatUser(user);
                                dialogSwitch.open();
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="button is-danger has-text-danger-100"
                              onClick={() => {
                                deleteUser(user.id, user.userType);
                              }}
                            >
                              Delete
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
      </div>
    </>
  );
};
export default Dashboard;

export const getServerSideProps = (async (ctx) => {
  const result = await prisma.credential.findMany();
  const userList = JSON.parse(JSON.stringify(result)) as typeof result;
  return {
    props: { userList },
  };
}) satisfies GetServerSideProps<{}>;
