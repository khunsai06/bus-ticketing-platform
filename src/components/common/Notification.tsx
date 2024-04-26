import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  onDelete?: VoidFunction;
  className?: string;
};

const Notification2: React.FC<Props> = ({ onDelete, children, className }) => {
  className += " notification";
  return (
    <div className={className}>
      <button className="delete" onClick={onDelete}></button>
      {children}
    </div>
  );
};

export default Notification2;
