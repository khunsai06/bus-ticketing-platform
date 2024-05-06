import React from "react";

type Props = {
  label: string;
  icon: React.ReactNode;
  optionList: string[];
  value?: string | number | readonly string[];
  onChange?: React.FormEventHandler<HTMLSelectElement>;
};

const FilterSelectable: React.FC<Props> = ({
  optionList,
  label,
  icon,
  value,
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
        <div className="select">
          <select value={value} onChange={onChange}>
            <option value="">None</option>
            {optionList.map((val, index) => (
              <option className="is-capitalized" key={index} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSelectable;
