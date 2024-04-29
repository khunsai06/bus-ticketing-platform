import PartnerNavbar from "@/components/operator/Navbar";
import useField from "@/hooks/useField";
import Notification2 from "@/components/common/Notification";
import { UtilLib } from "@/lib/util";
import { passwdSchema, requiredSchema, unameSchema } from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SimpleInput from "@/components/SimpleInput";
import AdminNavbar from "@/components/admin/Navbar";

const AdminLogin = () => {
  const unameFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });

  const passwdFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });

  // useEffect(() => {
  //   if (process.env.NODE_ENV === "development") {
  //     unameFieldCtrl.setMockValue("admin");
  //     passwdFieldCtrl.setMockValue("password");
  //     passwdFieldCtrl.validate();
  //   }
  // }, []);

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
    const res = await Auth.login({ uname, passwd }, $Enums.UserType.ADMIN);
    UtilLib.handleFetchResponse(res, {
      successCallBack(data) {
        clearResponseErr();
        rt.push("/admin/dash");
      },
      errCallback: setResponseErr,
    });
  };

  return (
    <>
      <AdminNavbar />
      <section className="section">
        <div className="columns is-centered">
          <div className="column is-half-tablet is-one-quarter-widescreen">
            <form onSubmit={handleLogin}>
              <h4 className="title is-5">Admin Access: Secure Login</h4>
              <hr />
              {responseErr && (
                <Notification2
                  className="is-danger is-light"
                  onDelete={clearResponseErr}
                >
                  {responseErr}
                </Notification2>
              )}
              <SimpleInput
                label="Username*"
                type="text"
                value={unameFieldCtrl.value}
                onChange={unameFieldCtrl.onChange}
                onFocus={unameFieldCtrl.onFocus}
                help={unameFieldCtrl.message}
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
                <label className="checkbox">
                  <input type="checkbox" /> Remember me
                </label>
              </div>
              <div className="field buttons">
                <button
                  className="button is-link is-expanded"
                  type="submit"
                  disabled={isAnyFieldInvalid}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminLogin;
