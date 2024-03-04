import TextField, { TextFieldStatus } from "@/components/TextField";
import React, { FC, FormEvent, useState, useEffect } from "react";
import { ZodError, z } from "zod";
import { mdiLoginVariant, mdiAccountOutline, mdiKeyOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { iconSize } from "@/constants";
import useTextFieldController from "@/hooks/useTextFieldController";
import { passwdSchema, unameSchema } from "@/lib/zod-schema";
import { concatenateStrings } from "@/lib/util";
import { useRouter } from "next/router";

const Page: FC<any> = () => {
    const rt = useRouter();
    const {
        value: unameValue,
        attr: unameAttr,
        mutate: mutateUname,
    } = useTextFieldController({
        initialValue: "",
        schema: unameSchema,
    });

    const {
        value: passwdValue,
        attr: passwdAttr,
        mutate: mutatePasswd,
    } = useTextFieldController({
        initialValue: "",
        schema: passwdSchema,
    });

    const [alert, setAlert] = useState<string | undefined>();
    const [isPending, setIsPending] = useState(false);

    const hideAlert = () => {
        setAlert(undefined);
    };
    useEffect(() => {
        if (process.env.NODE_ENV == "development") {
            mutateUname("johndoe.admin");
            mutatePasswd("qwerqwerQ1!");
        }
    }, []);

    const login = async (e: FormEvent) => {
        e.preventDefault();
        if (!unameAttr.validity || !passwdAttr.validity) {
            setAlert(
                "Oops! It seems there's an issue with your login credentials. Please make sure you've entered a valid username and password"
            );
            return;
        } else {
            setAlert(undefined);
        }
        setIsPending(true);
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uname: unameValue,
                passwd: passwdValue,
            }),
        });
        const parsed = await res.json();
        if (res.ok) {
            rt.push("/admin/dashboard");
            return;
        }
        setAlert(parsed.message);
        setIsPending(false);
    };

    return (
        <div className="hero is-fullheight is-flex-direction-column is-justify-content-center is-align-items-center">
            <div
                className="box"
                style={{ minWidth: "360px", maxWidth: "480px" }}
            >
                <h4 className="title is-5">Login as Administrator</h4>
                <hr />
                <form method="post" onSubmit={login}>
                    {alert && (
                        <div className="notification is-danger is-light">
                            <button className="delete" onClick={hideAlert} />
                            {alert}
                        </div>
                    )}

                    <TextField
                        type="text"
                        label="Username"
                        name={"uname"}
                        value={unameValue}
                        status={unameAttr.status}
                        help={unameAttr.help}
                        leadingIcon={
                            <Icon path={mdiAccountOutline} size={iconSize} />
                        }
                        onChange={({ currentTarget }) => {
                            mutateUname(currentTarget.value.trim());
                        }}
                    />

                    <TextField
                        type="text"
                        label="Password"
                        name={"passwd"}
                        value={passwdValue}
                        status={passwdAttr.status}
                        help={passwdAttr.help}
                        leadingIcon={
                            <Icon path={mdiKeyOutline} size={iconSize} />
                        }
                        onChange={({ currentTarget }) => {
                            mutatePasswd(currentTarget.value.trim());
                        }}
                    />

                    <hr />
                    <button
                        className={concatenateStrings([
                            "button is-primary",
                            isPending ? "is-loading" : "",
                        ])}
                        style={{ fontFamily: "inherit", width: "100%" }}
                        type="submit"
                    >
                        <span className="icon">
                            <Icon path={mdiLoginVariant} size={iconSize} />
                        </span>
                        <span>Login</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Page;
