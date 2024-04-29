import { mdiCurrencyUsd } from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const PartnerAside = () => {
  const rt = useRouter();

  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li>
          <Link
            className={rt.pathname === "/operator/dash" ? "is-active" : ""}
            href={"/operator/dash"}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            className={
              rt.pathname.includes("/operator/trips") ? "is-active" : ""
            }
            href={"/operator/trips"}
          >
            Route Management
          </Link>
        </li>
        <li>
          <Link
            className={rt.pathname === "/operator/log" ? "is-active" : ""}
            href={"/operator/log"}
          >
            Booking Log
          </Link>
        </li>
        <li>
          <Link
            className={rt.pathname === "/operator/money" ? "is-active" : ""}
            href={"/operator/money"}
          >
            <span>Financial</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default PartnerAside;
