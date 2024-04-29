import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const AdminAside = () => {
  const rt = useRouter();

  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li>
          <Link
            href={"/admin/dash"}
            className={rt.pathname === "/admin/dash" ? "is-active" : ""}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href={"/admin/apps"}
            className={rt.pathname === "/admin/apps" ? "is-active" : ""}
          >
            Applications
          </Link>
        </li>
        <li>
          <Link
            href={"/admin/users"}
            className={rt.pathname === "/admin/users" ? "is-active" : ""}
          >
            Users Management
          </Link>
        </li>
        <li>
          <Link
            href={"/admin/setting"}
            className={rt.pathname === "/admin/setting" ? "is-active" : ""}
          >
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default AdminAside;
