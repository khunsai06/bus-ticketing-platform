import Navbar3 from "@/components/consumer/Navbar3";
import useField from "@/hooks/useField";
import { UtilLib } from "@/lib/util";
import { emailSchema, passwdSchema } from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { isDev } from "./login";

export const ConsumerLoginPage = () => {
  const emailFieldCtrl = useField({
    initialValue: "",
    zodSchema: emailSchema,
  });

  const passwdFieldCtrl = useField({
    initialValue: "",
    zodSchema: passwdSchema,
  });

  useEffect(() => {
    if (isDev) {
      emailFieldCtrl.setValue("foo@foo.com");
      passwdFieldCtrl.setValue("sixtyNine69)^");
    }
  }, []);

  const [responseErr, setResponseErr] = React.useState("");
  const clearResponseErr = () => setResponseErr("");
  const rt = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFieldCtrl.validity || !passwdFieldCtrl.validity) return;
    const email = emailFieldCtrl.value;
    const passwd = passwdFieldCtrl.value;
    const res = await Auth.login({ email, passwd }, $Enums.UserType.CONSUMER);
    UtilLib.handleFetchResponse(res, {
      successCallBack(data) {
        clearResponseErr();
        rt.push("/consumer");
      },
      errCallback: setResponseErr,
    });
  };

  return (
    <>
      <Navbar3 />
      <main className="section">
        <div className="columns is-centered">
          <div className="column is-half-tablet is-one-quarter-widescreen">
            {responseErr && (
              <p>
                {responseErr}{" "}
                <button onClick={clearResponseErr}>clear error</button>
              </p>
            )}
            <form onSubmit={handleLogin}>
              <h4 className="title is-4">Consumer Sign Up Form</h4>
              {responseErr && (
                <Notification
                  className="is-danger is-light"
                  onDelete={clearResponseErr}
                >
                  {responseErr}
                </Notification>
              )}
              <div>
                <label>Email</label>
                <input
                  type="text"
                  value={emailFieldCtrl.value}
                  onChange={emailFieldCtrl.onChange}
                  onFocus={emailFieldCtrl.onFocus}
                />
                {!emailFieldCtrl.validity && (
                  <span>{emailFieldCtrl.message}</span>
                )}
              </div>
              <div>
                <label>Password</label>
                <input
                  type="text"
                  value={passwdFieldCtrl.value}
                  onChange={passwdFieldCtrl.onChange}
                  onFocus={passwdFieldCtrl.onFocus}
                />
                {!passwdFieldCtrl.validity && (
                  <span>{passwdFieldCtrl.message}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!emailFieldCtrl.validity || !passwdFieldCtrl.validity}
              >
                Login
              </button>
            </form>
            <span>
              Don't have an account? <Link href="#">Sign up</Link>
            </span>
          </div>
        </div>
      </main>
    </>
  );
};
