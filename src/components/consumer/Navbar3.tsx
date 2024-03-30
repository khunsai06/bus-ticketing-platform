import { mdiBucket, mdiShopping, mdiShoppingOutline } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";
import styles from "@/styles/badge.module.css";
const Navbar3 = () => {
  return (
    <nav
      className="navbar has-shadow is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container">
        <div className="navbar-brand"></div>
        <div className="navbar-menu is-active">
          <div className="navbar-start"></div>
          <div className="navbar-end"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar3;
