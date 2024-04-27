import { mdiHistory, mdiLogout, mdiLogoutVariant } from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";
import React from "react";
import { Indie_Flower } from "next/font/google";

const indieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});

const placeHolderUrl = "https://placehold.co/96x48";
const ConsumerNavbar = () => {
  const [openMenu, setOpenMenu] = React.useState(false);
  return (
    <nav className="navbar has-shadow">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item is-size-4 has-text-weight-bold">
            <span className={indieFlower.className}>Tickety Boo</span>
          </a>
          <a
            role="button"
            className="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className={"navbar-menu".concat(openMenu ? " is-active" : "")}>
          <div className="navbar-start"></div>
          <div className="navbar-end">
            <div className="navbar-item">
              <Link className="button" href={"/consumer/history"}>
                <span className="icon">
                  <Icon path={mdiHistory} size={1} />
                </span>
                <span>Bookings History</span>
              </Link>
            </div>
            <div className="navbar-item">
              <div className="buttons">
                <button className="button is-link">
                  <span className="icon">
                    <Icon path={mdiLogout} size={1} />
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ConsumerNavbar;
