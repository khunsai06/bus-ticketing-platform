import SimpleInput from "@/components/SimpleInput";
import PartnerNavbar from "@/components/operator/Navbar";
import useField from "@/hooks/useField";
import { emailSchema, requiredSchema } from "@/lib/zod-schema";
import { mdiUpload } from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Registration = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const nameFieldCtrl = useField({
    initialValue: "Company A",
    zodSchema: requiredSchema,
  });

  const emailFieldCtrl = useField({
    initialValue: "khunsai1610@gmail.com",
    zodSchema: emailSchema,
  });

  const [isFileAttached, setIsFileAttached] = useState(false);

  const [isAnyFieldInvalid, setIsAnyFieldInvalid] = useState(true);
  useEffect(() => {
    setIsAnyFieldInvalid(
      !nameFieldCtrl.validity || !emailFieldCtrl.validity || !isFileAttached
    );
  }, [nameFieldCtrl.validity, emailFieldCtrl.validity, isFileAttached]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append("companyName", nameFieldCtrl.value);
    formData.append("companyEmail", emailFieldCtrl.value);
    const files = formData.getAll("files[]");

    if (
      files.length === 0 ||
      (files.length === 1 && (files[0] as File).size === 0)
    ) {
      return;
    }

    try {
      const response = await fetch("/api/operator/register", {
        method: "POST",
        body: formData,
      });
      if (response.ok) return setIsSuccess(true);
    } catch (error) {
      console.error("Error sending application:", error);
    }
  };
  return (
    <>
      <PartnerNavbar />
      <section className="section">
        <div className="columns is-centered">
          <div className="column is-one-third-widescreen">
            <p className="title">
              Join our Network: Become a Partner/Operator on our Ticket Sales
              Platform
            </p>
            {isSuccess && (
              <div className="notification is-success is-light">
                <button
                  className="delete"
                  onClick={() => {
                    setIsSuccess(false);
                  }}
                ></button>
                <p className="has-text-weight-bold mb-1">
                  Application Sent Successfully!
                </p>
                <p>
                  Thank you for applying to join our platform. We've received
                  your application and will be in touch shortly. Welcome aboard!
                </p>
              </div>
            )}
            <form encType="multipart/form-data" onSubmit={handleSubmit}>
              <SimpleInput
                type="text"
                label="Company Name"
                value={nameFieldCtrl.value}
                help={nameFieldCtrl.message}
                onChange={nameFieldCtrl.onChange}
                onFocus={nameFieldCtrl.onFocus}
              />
              <SimpleInput
                type="text"
                label="Company Email"
                placeholder="example@example.com"
                value={emailFieldCtrl.value}
                help={emailFieldCtrl.message}
                onChange={emailFieldCtrl.onChange}
                onFocus={emailFieldCtrl.onFocus}
              />
              <div className="field">
                <div className="file is-boxed">
                  <label className="file-label">
                    <input
                      className="file-input"
                      type="file"
                      name="files[]"
                      multiple
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files?.length !== 0) setIsFileAttached(true);
                      }}
                    />
                    <span className="file-cta">
                      <span className="file-icon">
                        <Icon path={mdiUpload} size={"1.5rem"} />
                      </span>
                      <span className="file-label is-capitalized">
                        Send legal documents
                      </span>
                    </span>
                  </label>
                </div>
                <span className="help is-danger">{isFileAttached}</span>
              </div>
              <div className="field">
                <article className="message is-warning">
                  <p className="message-body">
                    Please note: Uploading legal document files is essential for
                    verification purposes. Ensure that all submitted documents
                    are valid and up-to-date. Failure to provide accurate or
                    complete documentation may result in delays or rejection of
                    your application. Thank you for your cooperation in this
                    matter.
                  </p>
                </article>
              </div>
              <div className="buttons">
                <button
                  type="submit"
                  className="button is-link"
                  disabled={isAnyFieldInvalid}
                >
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Registration;
