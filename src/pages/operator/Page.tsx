import Navbar2 from "@/components/operator/Navbar2";
import useField from "@/hooks/useField";
import { UtilLib } from "@/lib/util";
import { passwdSchema, unameSchema } from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export const Page = () => {
  const unameFieldCtrl = useField({
    initialValue: "",
    zodSchema: unameSchema,
  });

  const passwdFieldCtrl = useField({
    initialValue: "",
    zodSchema: passwdSchema,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      unameFieldCtrl.setMockValue("johndoe");
      passwdFieldCtrl.setMockValue("sixtyNine69)^");
      passwdFieldCtrl.validate();
    }
  }, []);

  const [isAnyFieldInvalid, setIsAnyFieldInvalid] = useState(true);
  useEffect(() => {
    setIsAnyFieldInvalid(!unameFieldCtrl.validity || !passwdFieldCtrl.validity);
  }, [unameFieldCtrl.validity, passwdFieldCtrl.validity]);

  const [responseErr, setResponseErr] = React.useState("");
  const clearResponseErr = () => setResponseErr("");
  const rt = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyFieldInvalid) return;
    const uname = unameFieldCtrl.value;
    const passwd = passwdFieldCtrl.value;
    const res = await Auth.login({ uname, passwd }, $Enums.UserType.OPERATOR);
    UtilLib.handleFetchResponse(res, {
      successCallBack(data) {
        clearResponseErr();
        rt.push("/operator");
      },
      errCallback: setResponseErr,
    });
  };

  return (
    <>
      <Navbar2 />
      <section className="section">
        <div className="columns is-centered">
          <div className="column is-half-tablet is-one-quarter-widescreen">
            {responseErr && (
              <p>
                {responseErr}{" "}
                <button onClick={clearResponseErr}>clear error</button>
              </p>
            )}
            <form onSubmit={handleLogin}>
              <h4 className="title is-4">Sign in to your account.</h4>
              {responseErr && (
                <Notification
                  className="is-danger is-light"
                  onDelete={clearResponseErr}
                >
                  {responseErr}
                </Notification>
              )}
              <input
                type="text"
                value={unameFieldCtrl.value}
                onChange={unameFieldCtrl.onChange}
                onFocus={unameFieldCtrl.onFocus}
              />
              {!unameFieldCtrl.validity && (
                <span>{unameFieldCtrl.message}</span>
              )}
              <br />
              <input
                type="text"
                value={passwdFieldCtrl.value}
                onChange={passwdFieldCtrl.onChange}
                onFocus={passwdFieldCtrl.onFocus}
              />
              {!passwdFieldCtrl.validity && (
                <span>{passwdFieldCtrl.message}</span>
              )}
              <br />
              <button type="submit" disabled={isAnyFieldInvalid}>
                Login
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
