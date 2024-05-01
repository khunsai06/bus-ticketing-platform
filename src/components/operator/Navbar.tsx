import { mdiLogout } from "@mdi/js";
import Icon from "@mdi/react";
import { Indie_Flower } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const indieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});
const PartnerNavbar = () => {
  const rt = useRouter();
  const foo =
    rt.pathname === "/operator/login" || rt.pathname === "/operator/register";
  return (
    <nav className="navbar has-shadow">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item is-size-4 has-text-weight-bold">
            <span className={indieFlower.className}>Tickety Boo</span>
          </a>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            <Link className="navbar-item" href={"/uploads/toc.html"}>
              Terms and Conditions
            </Link>
            <Link className="navbar-item" href={"/uploads/pp.html"}>
              Private Policy
            </Link>
          </div>
          <div className="navbar-end">
            {!foo && (
              <div className="navbar-item">
                <div className="buttons">
                  <Link
                    className="button is-link"
                    href={"/api/logout?as=operator"}
                  >
                    <span className="icon">
                      <Icon path={mdiLogout} size={1} />
                    </span>
                    <span>Logout</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PartnerNavbar;
