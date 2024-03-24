import useInputController from "@/hooks/useInputController";
import {
  passwdValidationSchema,
  unameValidationSchema,
} from "@/lib/zod-schema";
import { Auth } from "@/services/auth";
import { $Enums } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";

const isDev = process.env.NODE_ENV === "development";

const Page = () => {
  const unameInputCtrl = useInputController({
    initialValue: isDev ? "johndoe" : "",
    zodSchema: unameValidationSchema,
  });

  const passwdInputCtrl = useInputController({
    initialValue: isDev ? "sixtyNine69)^" : "",
    zodSchema: passwdValidationSchema,
  });

  const [responseErr, setResponseErr] = React.useState("");
  const clearError = () => setResponseErr("");
  const rt = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unameInputCtrl.validity || !passwdInputCtrl.validity) return;
    const uname = unameInputCtrl.value;
    const passwd = passwdInputCtrl.value;
    const res = await Auth.login({ uname, passwd }, $Enums.UserType.PARTNER);
    const parsed = await res.json();
    if (res.ok) {
      rt.push("/partner/trips");
    } else {
      setResponseErr(parsed.message);
    }
  };

  return (
    <div>
      {responseErr && (
        <p>
          {responseErr} <button onClick={clearError}>clear error</button>
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
