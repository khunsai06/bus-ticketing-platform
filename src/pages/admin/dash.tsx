import React, { FC } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminAside from "@/components/admin/Aside";

const Dashboard: FC<any> = () => {
  return (
    <>
      <AdminNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-one-fifth">
            <AdminAside />
          </div>
          <div className="column has-background-white-bis"></div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
