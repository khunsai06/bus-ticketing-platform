import React from "react";

type Props = {
  label: string;
  icon: React.ReactNode;
  optionList: { value: string | number | readonly string[]; option: string }[];
  value?: string | number | readonly string[];
  onChange?: React.FormEventHandler<Element>;
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
            {optionList.map(({ value, option }, index) => (
              <option key={index} value={value}>
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
