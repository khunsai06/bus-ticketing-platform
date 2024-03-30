import moment from "moment";
import React from "react";
type Props = { value: moment.Moment; label: string; icon?: React.ReactNode };
const FilterDate: React.FC<Props> = ({ icon, label, value }) => {
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
          value={value.format("YYYY-MM-DD")}
        />
      </div>
    </div>
  );
};

export default FilterDate;
