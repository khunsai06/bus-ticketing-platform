import Navbar3 from "@/components/consumer/Navbar3";
import useField from "@/hooks/useField";
import Notification2 from "@/components/common/Notification";
import { UtilLib } from "@/lib/util";
import { emailSchema, passwdSchema, unameSchema } from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SimpleInput from "@/components/SimpleInput";

const ConsumerLoginPage = () => {
  const emailFieldCtrl = useField({
    initialValue: "",
    zodSchema: emailSchema,
  });

  const passwdFieldCtrl = useField({
    initialValue: "",
    zodSchema: passwdSchema,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      emailFieldCtrl.setMockValue("foo@foo.com");
      passwdFieldCtrl.setMockValue("sixtyNine69)^");
    }
  }, []);

  const [isAnyFieldInvalid, setIsAnyFieldInvalid] = useState(true);
  useEffect(() => {
    setIsAnyFieldInvalid(!emailFieldCtrl.validity || !passwdFieldCtrl.validity);
  }, [emailFieldCtrl.validity, passwdFieldCtrl.validity]);

  const [responseErr, setResponseErr] = React.useState("");
  const clearResponseErr = () => setResponseErr("");
  const rt = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyFieldInvalid) return;
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
            <form onSubmit={handleLogin}>
              <h4 className="title is-4">Sign in to your account.</h4>
              {responseErr && (
                <Notification2
                  className="is-danger is-light"
                  onDelete={clearResponseErr}
                >
                  {responseErr}
                </Notification2>
              )}
              <SimpleInput
                label="Email*"
                type="email"
                value={emailFieldCtrl.value}
                onChange={emailFieldCtrl.onChange}
                onFocus={emailFieldCtrl.onFocus}
                help={emailFieldCtrl.message}
              />
              <SimpleInput
                label="Password*"
                type="password"
                value={passwdFieldCtrl.value}
                onChange={passwdFieldCtrl.onChange}
                onFocus={passwdFieldCtrl.onFocus}
                help={passwdFieldCtrl.message}
              />
              <div className="field">
                <div className="control">
                  <label className="checkbox">
                    <input type="checkbox" checked />
                    <span> Remember me</span>
                  </label>
                </div>
              </div>
              <div className="field buttons">
                <button
                  className="button is-link"
                  type="submit"
                  disabled={isAnyFieldInvalid}
                >
                  Login
                </button>
              </div>
            </form>
            <hr />
            <span>
              Don't have an account?{" "}
              <Link href="/consumer/signup">Sign up</Link>
            </span>
          </div>
        </div>
      </main>
    </>
  );
};

export default ConsumerLoginPage;
