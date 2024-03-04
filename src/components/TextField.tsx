import React, {
    type ChangeEventHandler,
    type FC,
    type HTMLInputTypeAttribute,
} from "react";
import { concatenateStrings } from "@/lib/util";

export type TextFieldStatus = "idle" | "success" | "fail";
type P = {
    label?: string;
    type: HTMLInputTypeAttribute;
    status?: TextFieldStatus;
    help?: string;
    leadingIcon?: any;
    tailingIcon?: any;
    name: string;
    defaultValue?: string;
    value?: any;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const TextField: FC<P> = ({
    label,
    type,
    status,
    help,
    leadingIcon,
    tailingIcon,
    name,
    value,
    defaultValue,
    onChange,
}) => {
    let statusClass = "";
    switch (status) {
        case "idle":
            statusClass = "";
            break;
        case "success":
            statusClass = "is-success";
            break;
        case "fail":
            statusClass = "is-danger";
            break;
        default:
            statusClass = "";
            break;
    }

    const hasIconLeftClass = leadingIcon ? "has-icons-left" : "";
    const hasIconRightClass = tailingIcon ? "has-icons-right" : "";

    return (
        <div className="field">
            {label && (
                <label className={concatenateStrings(["label"])}>{label}</label>
            )}
            <div
                className={concatenateStrings([
                    "control",
                    hasIconLeftClass,
                    hasIconRightClass,
                ])}
            >
                <input
                    className={concatenateStrings(["input", statusClass])}
                    type={type}
                    name={name}
                    value={value}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    style={{ fontFamily: "inherit" }}
                />
                {leadingIcon && (
                    <span className="icon is-left">{leadingIcon}</span>
                )}
                {tailingIcon && (
                    <span className="icon is-right">{tailingIcon}</span>
                )}
            </div>
            {help && (
                <span className={concatenateStrings(["help", statusClass])}>
                    {help}
                </span>
            )}
        </div>
    );
};

export default TextField;

// function getStatusBasedColor(status?: "success" | "fail"): string {
//     switch (status) {
//         case "success":
//             return "hsl(141, 53%, 53%)";
//         case "fail":
//             return "hsl(348, 100%, 61%)";
//         default:
//             return "hsl(0, 0%, 48%)";
//     }
// }
