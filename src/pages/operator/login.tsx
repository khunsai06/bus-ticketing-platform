import useField from "@/hooks/useField";
import { UtilLib } from "@/lib/util";
import { passwdSchema, unameSchema } from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";

const isDev = process.env.NODE_ENV === "development";

const Page = () => {
  const unameInputCtrl = useField({
    initialValue: isDev ? "johndoe" : "",
    zodSchema: unameSchema,
  });

  const passwdInputCtrl = useField({
    initialValue: isDev ? "sixtyNine69)^" : "",
    zodSchema: passwdSchema,
  });

  const [responseErr, setResponseErr] = React.useState("");
  const clearResponseErr = () => setResponseErr("");
  const rt = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unameInputCtrl.validity || !passwdInputCtrl.validity) return;
    const uname = unameInputCtrl.value;
    const passwd = passwdInputCtrl.value;
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
    <div>
      {responseErr && (
        <p>
          {responseErr} <button onClick={clearResponseErr}>clear error</button>
        </p>
      )}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={unameInputCtrl.value}
          onChange={unameInputCtrl.onChange}
          onFocus={unameInputCtrl.onFocus}
        />
        {!unameInputCtrl.validity && <span>{unameInputCtrl.message}</span>}
        <br />
        <input
          type="text"
          value={passwdInputCtrl.value}
          onChange={passwdInputCtrl.onChange}
          onFocus={passwdInputCtrl.onFocus}
        />
        {!passwdInputCtrl.validity && <span>{passwdInputCtrl.message}</span>}
        <br />
        <button
          type="submit"
          disabled={!unameInputCtrl.validity || !passwdInputCtrl.validity}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Page;
