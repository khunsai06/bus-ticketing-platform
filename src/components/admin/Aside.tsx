import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const AdminAside = () => {
  const rt = useRouter();
  console.log(rt.pathname);
  console.log(rt.query);

  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li>
          <Link href={"/admin/dash"}>Dashboard</Link>
        </li>
        <li>
          <Link href={"/admin/apps"}>Applications</Link>
        </li>
        <li>
          <a>Users</a>
        </li>
      </ul>
      <p className="menu-label">Transactions</p>
      <ul className="menu-list">
        <li>
          <a>Payments</a>
        </li>
        <li>
          <a>Transfers</a>
        </li>
        <li>
          <a>Balance</a>
        </li>
      </ul>
    </aside>
  );
};

export default AdminAside;