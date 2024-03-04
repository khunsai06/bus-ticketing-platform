import { TextFieldStatus } from "@/components/TextField";
import { useState } from "react";
import { ZodError, z, type ZodSchema } from "zod";

type Attr = {
    status?: TextFieldStatus;
    help?: string;
    color?: string;
    validity?: boolean;
};

function useTextFieldController<T>({
    initialValue,
    schema,
}: {
    initialValue: T;
    schema: ZodSchema;
}) {
    const [value, setValue] = useState<T>(initialValue);
    const [attr, setAttr] = useState<Attr>({ status: "idle", validity: false });
    const mutate = (newValue: T) => {
        setValue(newValue);
        try {
            schema.parse(newValue);
            setAttr({
                validity: true,
                status: "success",
                color: getStatusBasedColor("success"),
            });
        } catch (error) {
            if (error instanceof ZodError) {
                setAttr({
                    validity: false,
                    status: "fail",
                    help: error.errors[0].message,
                    color: getStatusBasedColor("fail"),
                });
            }
        }
    };
    return {
        value,
        attr,
        mutate,
    };
}

export default useTextFieldController;

function getStatusBasedColor(status: TextFieldStatus): string {
    switch (status) {
        case "idle":
            return "";
        case "success":
            return "hsl(141, 71%, 48%)";
        case "fail":
            return "hsl(348, 100%, 61%)";
        default:
            return "";
    }
}

// hsl(0, 0%, 48%)
