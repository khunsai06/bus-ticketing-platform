import useFieldController from "@/hooks/useFieldController";
import { UtilLib } from "@/lib/util";
import { emailSchema, passwdSchema, unameSchema } from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const isDev = process.env.NODE_ENV === "development";

const ConsumerLoginPage = () => {
  const emailFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: emailSchema,
  });

  const passwdFieldCtrl = useFieldController({
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
    <div>
      {responseErr && (
        <p>
          {responseErr} <button onClick={clearResponseErr}>clear error</button>
        </p>
      )}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="text"
            value={emailFieldCtrl.value}
            onChange={emailFieldCtrl.onChange}
            onFocus={emailFieldCtrl.onFocus}
          />
          {!emailFieldCtrl.validity && <span>{emailFieldCtrl.message}</span>}
        </div>
        <div>
          <label>Password</label>
          <input
            type="text"
            value={passwdFieldCtrl.value}
            onChange={passwdFieldCtrl.onChange}
            onFocus={passwdFieldCtrl.onFocus}
          />
          {!passwdFieldCtrl.validity && <span>{passwdFieldCtrl.message}</span>}
        </div>
        <button
          type="submit"
          disabled={!emailFieldCtrl.validity || !passwdFieldCtrl.validity}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default ConsumerLoginPage;
