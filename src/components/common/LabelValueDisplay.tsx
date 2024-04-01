import React from "react";

type Props = { label: string; value: string; className?: string };
const LabelValueDisplay: React.FC<Props> = ({ label, value, className }) => {
  return (
    <div className="field">
      <span className="has-text-weight-medium">{label}: </span>
      <span className={className}>{value}</span>
    </div>
  );
};

export default LabelValueDisplay;
