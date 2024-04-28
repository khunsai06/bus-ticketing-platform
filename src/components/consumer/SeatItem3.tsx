import { Seat } from "@prisma/client";
import React from "react";
import Icon from "@mdi/react";
import { mdiLock, mdiAccountGroup, mdiLockOutline } from "@mdi/js";

type Props = {
  seat: Seat;
  selected: boolean;
  onSelect: (s: Seat) => void;
  onUnSelect: (s: Seat) => void;
};
const SeatItem3: React.FC<Props> = ({
  seat,
  selected,
  onSelect,
  onUnSelect,
}) => {
  const number = seat.number;
  const status = seat.status;
  let buttonStyle = "button";
  if (status === "LOCKED") buttonStyle += " has-background-text-90";
  if (selected) buttonStyle += " is-link";

  const onClickHandler = () => {
    if (status !== "FREE") return;
    if (!selected) onSelect(seat);
    if (selected) onUnSelect(seat);
  };

  return (
    <>
      <div className="cell">
        <button
          className={buttonStyle}
          style={{ width: "100%", height: "100%" }}
          disabled={status !== "FREE"}
          onClick={onClickHandler}
        >
          {status === "FREE" && <span>{number}</span>}
          {status === "LOCKED" && (
            <span className="icon">
              <Icon path={mdiLockOutline} size="1.5rem" />
            </span>
          )}
          {status === "BOOKED" && (
            <span className="icon">
              <Icon path={mdiAccountGroup} size="1.5rem" />
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default SeatItem3;
