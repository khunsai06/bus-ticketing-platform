import React from "react";

const Aside = () => {
  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li style={{ background: "inherited" }}>
          <a>Dashboard</a>
        </li>
        <li>
          <a>Customers</a>
        </li>
      </ul>
      <p className="menu-label">Administration</p>
      <ul className="menu-list">
        <li>
          <a>Team Settings</a>
        </li>
        <li>
          <a>Manage Your Team</a>
        </li>
        <li>
          <a>Invitations</a>
        </li>
        <li>
          <a>Authentication</a>
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

export default Aside;
