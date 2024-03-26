import useFieldController from "@/hooks/useFieldController";
import { DatetimeLib } from "@/lib/datetime";
import { UtilLib } from "@/lib/util";
import {
  confirmPasswordSchema,
  dateOfBirthSchema,
  emailSchema,
  noneEmptySchema,
  passwdSchema,
} from "@/lib/zod-schema";
import { ConsumerServices } from "@/services/consumer";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ZodError } from "zod";

const ConsumerSignUpPage = () => {
  const nameFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: noneEmptySchema,
  });
  const dobFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: dateOfBirthSchema,
  });
  const genderFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: noneEmptySchema,
  });
  const emailFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: emailSchema,
  });
  const passwdFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: passwdSchema,
  });
  const confirmFieldCtrl = useFieldController({
    initialValue: "",
    zodSchema: passwdSchema,
  });

  useEffect(() => {
    if (true) {
      nameFieldCtrl.setValue("John Doe");
      dobFieldCtrl.setValue("2000-01-01");
      genderFieldCtrl.setValue("male");
      emailFieldCtrl.setValue("foo@foo.com");
      passwdFieldCtrl.setValue("sixtyNine69)^");
      confirmFieldCtrl.setValue("sixtyNine69)^");
    }
  }, []);

  const [unMatchErr, setUnMatchErr] = useState("");
  useEffect(() => {
    try {
      if (confirmFieldCtrl.isFocus && confirmFieldCtrl.validity) {
        confirmPasswordSchema.parse({
          passwd: passwdFieldCtrl.value,
          confirm: confirmFieldCtrl.value,
        });
        setUnMatchErr("");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        setUnMatchErr(error.errors[0].message);
      }
    }
  }, [
    passwdFieldCtrl.value,
    confirmFieldCtrl.value,
    confirmFieldCtrl.isFocus,
    confirmFieldCtrl.validity,
  ]);

  const [isAnyFieldInvalid, setIsAnyFieldInvalid] = useState(true);
  useEffect(() => {
    const checkValidity = () => {
      const validity =
        !nameFieldCtrl.validity ||
        !dobFieldCtrl.validity ||
        !genderFieldCtrl.validity ||
        !emailFieldCtrl.validity ||
        !passwdFieldCtrl.validity ||
        !confirmFieldCtrl.validity ||
        !!unMatchErr;
      setIsAnyFieldInvalid(validity);
    };
    checkValidity();
  }, [
    nameFieldCtrl.validity,
    dobFieldCtrl.validity,
    genderFieldCtrl.validity,
    emailFieldCtrl.validity,
    passwdFieldCtrl.validity,
    confirmFieldCtrl.validity,
    unMatchErr,
  ]);

  const [responseErr, setResponseErr] = React.useState("");
  const clearResponseErr = () => setResponseErr("");
  const rt = useRouter();

  const signUpHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyFieldInvalid) return;
    const data = {
      name: nameFieldCtrl.value,
      dob: dobFieldCtrl.value,
      gender: genderFieldCtrl.value,
      email: emailFieldCtrl.value,
      passwd: passwdFieldCtrl.value,
    };
    const res = await ConsumerServices.Auth.SignUp(data);
    UtilLib.handleFetchResponse(res, {
      successCallBack() {
        clearResponseErr();
        rt.push("/consumer/login");
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
      <form onSubmit={signUpHandler}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={nameFieldCtrl.value}
            onChange={nameFieldCtrl.onChange}
            onFocus={nameFieldCtrl.onFocus}
          />
          {!nameFieldCtrl.validity && <span>{nameFieldCtrl.message}</span>}
        </div>
        <div>
          <label>Birthday</label>
          <input
            type="date"
            name="dob"
            max={DatetimeLib.latestDate16YearsAgo()}
            value={dobFieldCtrl.value}
            onChange={dobFieldCtrl.onChange}
            onFocus={dobFieldCtrl.onFocus}
          />
          {!dobFieldCtrl.validity && <span>{dobFieldCtrl.message}</span>}
        </div>
        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={genderFieldCtrl.value}
            onChange={genderFieldCtrl.onChange}
            onFocus={genderFieldCtrl.onFocus}
          >
            <option value="">N/A</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {!genderFieldCtrl.validity && <span>{genderFieldCtrl.message}</span>}
        </div>
        <div>
          <label>Email</label>
          <input
            type="text"
            name="email"
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
            name="passwd"
            value={passwdFieldCtrl.value}
            onChange={passwdFieldCtrl.onChange}
            onFocus={passwdFieldCtrl.onFocus}
          />
          {!passwdFieldCtrl.validity && <span>{passwdFieldCtrl.message}</span>}
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="text"
            name="confirm"
            value={confirmFieldCtrl.value}
            onChange={confirmFieldCtrl.onChange}
            onFocus={confirmFieldCtrl.onFocus}
          />
          {!confirmFieldCtrl.validity && (
            <span>{confirmFieldCtrl.message}</span>
          )}
          {confirmFieldCtrl.validity && unMatchErr && <span>{unMatchErr}</span>}
        </div>
        <button type="submit" disabled={isAnyFieldInvalid}>
          Sign Up
        </button>
      </form>
      <Link href="/consumer/login">Login</Link>
    </div>
  );
};

export default ConsumerSignUpPage;
