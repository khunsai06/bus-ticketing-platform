import SimpleInput from "@/components/SimpleInput";
import SimpleSelect from "@/components/SimpleSelect";
import Notification2 from "@/components/common/Notification";
import ConsumerNavbar from "@/components/consumer/Navbar";
import useField from "@/hooks/useField";
import { DatetimeLib } from "@/lib/datetime";
import { UtilLib } from "@/lib/util";
import {
  confirmPasswordSchema,
  dateOfBirthSchema,
  emailSchema,
  requiredSchema,
  passwdSchema,
} from "@/lib/zod-schema";
import { ConsumerServices } from "@/services/consumer";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ZodError } from "zod";

const ConsumerSignUpPage = () => {
  const nameFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });
  const dobFieldCtrl = useField({
    initialValue: "",
    zodSchema: dateOfBirthSchema,
  });
  const genderFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });
  const phoneFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });
  const emailFieldCtrl = useField({
    initialValue: "",
    zodSchema: emailSchema,
  });
  const passwdFieldCtrl = useField({
    initialValue: "",
    zodSchema: passwdSchema,
  });
  const confirmFieldCtrl = useField({
    initialValue: "",
    zodSchema: passwdSchema,
  });

  const [tNCAgreement, setTNCAgreement] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      nameFieldCtrl.setMockValue("John Doe");
      dobFieldCtrl.setMockValue("2000-01-01");
      genderFieldCtrl.setMockValue("male");
      emailFieldCtrl.setMockValue("foo@foo.com");
      phoneFieldCtrl.setMockValue("+95912341234");
      passwdFieldCtrl.setMockValue("sixtyNine69)^");
      confirmFieldCtrl.setMockValue("sixtyNine69)^");
    }
  }, []);

  const [passwdMismatchErr, setPasswdMismatchErr] = useState<string>();
  useEffect(() => {
    try {
      if (!confirmFieldCtrl.validity) return;
      confirmPasswordSchema.parse({
        passwd: passwdFieldCtrl.value,
        confirm: confirmFieldCtrl.value,
      });
      setPasswdMismatchErr(undefined);
    } catch (error) {
      setPasswdMismatchErr((error as ZodError).errors[0].message);
    }
  }, [
    passwdFieldCtrl.value,
    confirmFieldCtrl.value,
    confirmFieldCtrl.validity,
  ]);

  const [isAnyFieldInvalid, setIsAnyFieldInvalid] = useState(true);
  useEffect(() => {
    setIsAnyFieldInvalid(
      !nameFieldCtrl.validity ||
        !dobFieldCtrl.validity ||
        !genderFieldCtrl.validity ||
        !emailFieldCtrl.validity ||
        !phoneFieldCtrl.validity ||
        !passwdFieldCtrl.validity ||
        !confirmFieldCtrl.validity ||
        !!passwdMismatchErr ||
        !tNCAgreement
    );
  }, [
    nameFieldCtrl.validity,
    dobFieldCtrl.validity,
    genderFieldCtrl.validity,
    emailFieldCtrl.validity,
    phoneFieldCtrl.validity,
    passwdFieldCtrl.validity,
    confirmFieldCtrl.validity,
    passwdMismatchErr,
    tNCAgreement,
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
      phone: phoneFieldCtrl.value,
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
    <>
      <ConsumerNavbar />
      <main className="section">
        <div className="columns is-centered">
          <div className="column is-half-tablet is-one-quarter-widescreen">
            <form onSubmit={signUpHandler}>
              <h4 className="title is-4">Create your account.</h4>
              {responseErr && (
                <Notification2
                  className="is-danger is-light"
                  onDelete={clearResponseErr}
                >
                  {responseErr}
                </Notification2>
              )}
              <SimpleInput
                label="Full Name*"
                type="text"
                onChange={nameFieldCtrl.onChange}
                onFocus={nameFieldCtrl.onFocus}
                value={nameFieldCtrl.value}
                help={nameFieldCtrl.message}
              />
              <div className="field is-grouped mb-0">
                <SimpleInput
                  label="Birthday*"
                  type="date"
                  max={DatetimeLib.latestDate16YearsAgo()}
                  onChange={dobFieldCtrl.onChange}
                  onFocus={dobFieldCtrl.onFocus}
                  value={dobFieldCtrl.value}
                  help={dobFieldCtrl.message}
                />
                <SimpleSelect
                  label="Gender*"
                  onChange={genderFieldCtrl.onChange}
                  onFocus={genderFieldCtrl.onFocus}
                  value={genderFieldCtrl.value}
                  help={genderFieldCtrl.message}
                >
                  <option value="">None</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </SimpleSelect>
              </div>
              <SimpleInput
                label="Phone*"
                type="tel"
                onChange={phoneFieldCtrl.onChange}
                onFocus={phoneFieldCtrl.onFocus}
                value={phoneFieldCtrl.value}
                help={phoneFieldCtrl.message}
              />
              <SimpleInput
                label="Email*"
                type="text"
                onChange={emailFieldCtrl.onChange}
                onFocus={emailFieldCtrl.onFocus}
                value={emailFieldCtrl.value}
                help={emailFieldCtrl.message}
              />
              <SimpleInput
                label="Password*"
                type="password"
                onChange={passwdFieldCtrl.onChange}
                onFocus={passwdFieldCtrl.onFocus}
                value={passwdFieldCtrl.value}
                help={passwdFieldCtrl.message}
              />
              <SimpleInput
                label="Confirm Password*"
                type="password"
                onChange={confirmFieldCtrl.onChange}
                onFocus={confirmFieldCtrl.onFocus}
                value={confirmFieldCtrl.value}
                help={
                  !confirmFieldCtrl.validity
                    ? confirmFieldCtrl.message
                    : confirmFieldCtrl.validity && passwdMismatchErr
                    ? passwdMismatchErr
                    : undefined
                }
              />
              <div className="field">
                <div className="control">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={tNCAgreement}
                      onChange={() => {
                        setTNCAgreement(!tNCAgreement);
                      }}
                    />
                    <span> I agree to the </span>
                    <a href="#">terms and conditions</a>
                  </label>
                </div>
              </div>
              <div className="field buttons">
                <button
                  className="button is-link"
                  type="submit"
                  disabled={isAnyFieldInvalid}
                >
                  Sign Up
                </button>
              </div>
            </form>
            <hr />
            <span>
              Already have an account?{" "}
              <Link href="/consumer/login">Log in</Link>
            </span>
          </div>
        </div>
      </main>
    </>
  );
};

export default ConsumerSignUpPage;
