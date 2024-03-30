import React from "react";

type Props = { optionList: string[]; label: string; icon?: React.ReactNode };
const FilterSelectable: React.FC<Props> = ({ optionList, label, icon }) => {
  return (
    <div className="field has-addons">
      <div className="control">
        <button className="button is-static">
          {icon && <span className="icon">{icon}</span>}
          <span>{label}</span>
        </button>
      </div>
      <div className="control">
        <div className="select">
          <select name="">
            {optionList.map((option, index) => (
              <option key={index} value={index}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSelectable;
