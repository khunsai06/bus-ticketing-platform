import React from "react";

type Props = { label: string; value: string };
const LabelValueDisplay: React.FC<Props> = ({ label, value }) => {
  return (
    <div className="field">
      <span className="has-text-weight-medium">{label}: </span>
      <span>{value}</span>
    </div>
  );
};

export default LabelValueDisplay;
