import React from "react";
import SimpleInput from "../SimpleInput";
import SimpleSelect from "../SimpleSelect";
import { Credential } from "@prisma/client";
import { HttpVerb } from "@/constants";

type Props = {
  user?: Credential;
  active: boolean;
  closeDialog: VoidFunction;
  refresh: VoidFunction;
};

const AccountEntryDialog: React.FC<Props> = ({
  user,
  active,
  closeDialog,
  refresh,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get("email");
    const uname = fd.get("uname");
    const passwd = fd.get("passwd");
    try {
      const res = await fetch(`/api/admin/x-users-ops?cid=${user?.id}`, {
        method: HttpVerb.PATCH,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, uname, passwd }),
      });
      if (res.status == 400) {
        const msg = (await res.json()).msg;
        setError(msg);
      }
      if (res.ok) return refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`modal ${active ? "is-active" : ""}`} id="modal-js-example">
      <div className="modal-background" onClick={closeDialog}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <p className="modal-card-title">Credential Entry Form</p>
          <button
            className="delete"
            aria-label="close"
            onClick={closeDialog}
          ></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-card-body">
            {error && (
              <div className="notification is-danger is-light">
                <button
                  className="delete"
                  onClick={() => setError("")}
                ></button>
                {error}
              </div>
            )}
            <input type="hidden" name="cid" defaultValue={user?.id} />
            <SimpleInput
              label="Email"
              type="text"
              name="email"
              defaultValue={user?.email!}
            />
            <SimpleInput
              label="Username"
              type="text"
              name="uname"
              defaultValue={user?.uname!}
            />
            <SimpleInput label="New Password" type="text" name="passwd" />
          </div>
          <div className="modal-card-foot">
            <div className="buttons">
              <button type="reset" className="button" onClick={closeDialog}>
                Cancel
              </button>
              <button type="submit" className="button is-link">
                Change
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEntryDialog;
