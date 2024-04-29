import React from "react";

const Pagination = () => {
  return (
    <nav className="pagination" role="navigation" aria-label="pagination">
      <a
        className="pagination-previous is-disabled"
        title="This is the first page"
      >
        Previous
      </a>
      <a href="#" className="pagination-next">
        Next page
      </a>
      <ul className="pagination-list">
        <li>
          <a
            className="pagination-link is-current"
            aria-label="Page 1"
            aria-current="page"
          >
            1
          </a>
        </li>
        <li>
          <a href="#" className="pagination-link" aria-label="Goto page 2">
            2
          </a>
        </li>
        <li>
          <a href="#" className="pagination-link" aria-label="Goto page 3">
            3
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
