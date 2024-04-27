import { Indie_Flower } from "next/font/google";
import React from "react";

const indieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});
const PartnerNavbar = () => {
  return (
    <nav className="navbar has-shadow">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item is-size-4 has-text-weight-bold">
            <span className={indieFlower.className}>Tickety Boo</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default PartnerNavbar;
