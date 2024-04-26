import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  label?: string;
  name?: string;
  help?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  onFocus?: React.FocusEventHandler<HTMLSelectElement>;
};

const SimpleSelect: React.FC<Props> = ({ label, children, help, ...attrs }) => {
  return (
    <div className="field">
      {label && <label className="label">{label}</label>}
      <div className="control">
        <div className="select">
          <select {...attrs}>{children}</select>
        </div>
      </div>
      {help && <p className="help is-danger">{help}</p>}
    </div>
  );
};

export default SimpleSelect;
