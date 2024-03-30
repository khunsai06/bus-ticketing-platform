import React from "react";

type Props = {
  label: string;
  type: React.HTMLInputTypeAttribute;
  name?: string;
  min?: string | number;
  max?: string | number;
  help?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

const SimpleInput: React.FC<Props> = ({ label, help, ...attrs }) => {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <input {...attrs} className="input" />
      </div>
      {help && <p className="help is-danger">{help}</p>}
    </div>
  );
};

export default SimpleInput;
