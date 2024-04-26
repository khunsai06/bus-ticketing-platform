import React from "react";

type Props = {
  label: string;
  name?: string;
  placeholder?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  cols: number;
  rows: number;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
};

const SimpleTextArea: React.FC<Props> = ({ label, ...attrs }) => {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <textarea className="textarea" {...attrs} />
      </div>
    </div>
  );
};

export default SimpleTextArea;
