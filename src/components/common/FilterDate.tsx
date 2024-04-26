import moment from "moment";
import React from "react";
type Props = {
  label: string;
  icon: React.ReactNode;
  min?: moment.Moment;
  value?: moment.Moment;
  defaultValue?: moment.Moment;
  onChange?: React.ChangeEventHandler<Element>;
};
const FilterDate: React.FC<Props> = ({
  icon,
  label,
  min,
  value,
  defaultValue,
  onChange,
}) => {
  return (
    <div className="field has-addons">
      <div className="control">
        <button className="button is-static">
          {icon && <span className="icon">{icon}</span>}
          <span>{label}</span>
        </button>
      </div>
      <div className="control">
        <input
          className="input"
          type="date"
          min={min?.format("YYYY-MM-DD")}
          value={value?.format("YYYY-MM-DD")}
          defaultValue={defaultValue?.format("YYYY-MM-DD")}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default FilterDate;
