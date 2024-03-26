import TextField from "@/components/TextField";
import React, { FC, FormEvent, useState, useEffect } from "react";
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
    value: unameFieldValue,
    attr: unameFieldAttr,
    mutate: mutateUname,
  } = useTextFieldController({
    initialValue: "",
    schema: unameSchema,
  });

  const {
    value: passwdFieldValue,
    attr: passwdFieldAttr,
    mutate: mutatePasswd,
  } = useTextFieldController({
    initialValue: "",
    schema: passwdSchema,
  });

  useEffect(() => {
    if (process.env.NODE_ENV == "development") {
      mutateUname("johndoe.admin");
      mutatePasswd("qwerqwerQ1!");
    }
  }, []);

  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const hideAlert = () => {
    setError(undefined);
  };

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uname: unameFieldValue,
        passwd: passwdFieldValue,
      }),
    }).finally(() => {
      setIsLoading(false);
    });
    const parsed = await res.json();
    if (res.ok) {
      rt.push("/admin/dashboard");
      return;
    }
    setError(parsed.message);
  };

  return (
    <div
      style={{ height: "100vh" }}
      className="columns is-mobile is-justify-content-center is-align-items-center"
    >
      <div className="column p-0 is-4-desktop is-5-tablet is-10-mobile">
        <div className="box">
          <h4 className="title is-5">Login as Administrator</h4>
          <hr />
          <form method="post" onSubmit={login}>
            {error && (
              <div className="notification is-danger is-light">
                <button className="delete" onClick={hideAlert} />
                {error}
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
                isLoading ? "is-loading" : "",
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
    </div>
  );
};
export default Page;
