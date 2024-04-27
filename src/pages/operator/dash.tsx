import React, { FC } from "react";
import PartnerNavbar from "@/components/operator/Navbar";
import PartnerAside from "@/components/operator/Aside";

const Dashboard: FC<any> = () => {
  return (
    <>
      <PartnerNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-one-fifth">
            <PartnerAside />
          </div>
          <div className="column has-background-white-bis"></div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
