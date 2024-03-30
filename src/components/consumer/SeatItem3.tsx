import { Seat } from "@prisma/client";
import React from "react";
import Icon from "@mdi/react";
import { mdiLock, mdiAccountGroup } from "@mdi/js";

type Props = { seat: Seat; selected: boolean; onSelect: (s: Seat) => void };
const SeatItem3: React.FC<Props> = ({ seat, selected, onSelect }) => {
  const number = seat.number;
  const status = seat.status;
  const selectedStyle =
    " has-background-link-light has-text-link has-text-weight-medium";
  let boxStyle = "box is-flex is-justify-content-center is-align-items-center";
  let cellStyle = "cell";
  if (selected) boxStyle += selectedStyle;
  if (status === "FREE") cellStyle += " is-clickable";

  return (
    <>
      <div
        className={cellStyle}
        onClick={() => {
          if (status === "FREE") onSelect(seat);
        }}
      >
        <div className={boxStyle}>
          {status === "FREE" && <span>{number}</span>}
          {status === "LOCKED" && (
            <span className="icon">
              <Icon path={mdiLock} size="1.5rem" />
            </span>
          )}
          {status === "RESERVED" && (
            <span className="icon">
              <Icon path={mdiAccountGroup} size="1.5rem" />
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default SeatItem3;
