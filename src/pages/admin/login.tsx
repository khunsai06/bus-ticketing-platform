import TextField from "@/components/TextField";
import React, { FC, FormEvent, useState, useEffect } from "react";
import { mdiLoginVariant, mdiAccountOutline, mdiKeyOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { iconSize } from "@/constants";
import useTextFieldController from "@/hooks/useTextFieldController";
import {
  passwdValidationSchema,
  unameValidationSchema,
} from "@/lib/zod-schema";
import { concatenateStrings } from "@/lib/util";
import { useRouter } from "next/router";

const Page: FC<any> = () => {
  const rt = useRouter();
  const {
    value: unameFieldValue,
    attr: unameFieldAttr,
    mutate: mutateUname,
  } = useTextFieldController({
    initialValue: "",
    schema: unameValidationSchema,
  });

  const {
    value: passwdFieldValue,
    attr: passwdFieldAttr,
    mutate: mutatePasswd,
  } = useTextFieldController({
    initialValue: "",
    schema: passwdValidationSchema,
  });

  useEffect(() => {
    if (process.env.NODE_ENV == "development") {
      mutateUname("johndoe.admin");
      mutatePasswd("qwerqwerQ1!");
    }
  }, []);

  const [alert, setAlert] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const hideAlert = () => {
    setAlert(undefined);
  };

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uname: unameFieldValue,
        passwd: passwdFieldValue,
      }),
    }).finally(() => {
      setIsPending(false);
    });
    const parsed = await res.json();
    if (res.ok) {
      rt.push("/admin/dashboard");
      return;
    }
    setAlert(parsed.message);
  };

  return (
    <div className="hero is-fullheight is-flex-direction-column is-justify-content-center is-align-items-center">
      <div className="box" style={{ minWidth: "360px", maxWidth: "480px" }}>
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
            value={unameFieldValue}
            status={unameFieldAttr.status}
            help={unameFieldAttr.help}
            leadingIcon={<Icon path={mdiAccountOutline} size={iconSize} />}
            onChange={({ currentTarget }) => {
              mutateUname(currentTarget.value.trim());
            }}
          />

          <TextField
            type="text"
            label="Password"
            name={"passwd"}
            value={passwdFieldValue}
            status={passwdFieldAttr.status}
            help={passwdFieldAttr.help}
            leadingIcon={<Icon path={mdiKeyOutline} size={iconSize} />}
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
            disabled={!(unameFieldAttr.validity && passwdFieldAttr.validity)}
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
