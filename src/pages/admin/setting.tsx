import React, { FC, useState } from "react";
import AdminNavbar from "@/components/admin/Navbar";
import AdminAside from "@/components/admin/Aside";
import Icon from "@mdi/react";
import { mdiUpload } from "@mdi/js";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/lib/prisma-client";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
type CH = React.ChangeEventHandler<HTMLInputElement>;
const Dashboard: FC<Props> = ({ setting }) => {
  const [comm, setComm] = useState(setting.commissionRate);
  const [tax, setTax] = useState(setting.taxRate);
  const [refundTime, setRefundTime] = useState(setting.refundTimeFrame);
  const changeSetting = async (
    value: number,
    ops: "comm" | "tax" | "refundTime"
  ) => {
    try {
      await fetch(`/api/admin/x-settings-ops?value=${value}&ops=${ops}`);
    } catch (error) {
      console.error(error);
    }
  };
  const uploadToc: CH = async (e) => {
    const file = e.target.files?.item(0);
    if (!file) {
      console.error("No file selected");
      return;
    }
    uploadFile(file, "toc");
  };
  const uploadPp: CH = async (e) => {
    const file = e.target.files?.item(0);
    if (!file) {
      console.error("No file selected");
      return;
    }
    uploadFile(file, "pp");
  };
  return (
    <>
      <AdminNavbar />
      <div className="section p-0" style={{ height: "calc(100vh - 52px)" }}>
        <div className="columns m-0" style={{ height: "100%" }}>
          <div className="column is-2">
            <AdminAside />
          </div>
          <div className="column has-background-white-bis">
            <div className="fixed-grid has-2-cols">
              <div className="grid">
                <div className="cell">
                  <div className="box is-flex is-flex-direction-column is-align-items-start">
                    <div className="field has-addons has-addons-centered">
                      <p className="control">
                        <button className="button is-static">
                          Commission Rate
                        </button>
                      </p>
                      <p className="control">
                        <input
                          className="input"
                          type="number"
                          placeholder="0.05"
                          value={comm}
                          onChange={(e) => setComm(parseFloat(e.target.value))}
                        />
                      </p>
                      <p className="control">
                        <button
                          className="button is-link"
                          onClick={() => changeSetting(comm, "comm")}
                        >
                          Change
                        </button>
                      </p>
                    </div>
                    <div className="field has-addons has-addons-centered">
                      <p className="control">
                        <button className="button is-static">Tax Rate</button>
                      </p>
                      <p className="control">
                        <input
                          className="input"
                          type="number"
                          placeholder="0.05"
                          value={tax}
                          onChange={(e) => setTax(parseFloat(e.target.value))}
                        />
                      </p>
                      <p className="control">
                        <button
                          className="button is-link"
                          onClick={() => changeSetting(tax, "tax")}
                        >
                          Change
                        </button>
                      </p>
                    </div>
                    <div className="field has-addons has-addons-centered">
                      <p className="control">
                        <button className="button is-static">
                          Refund Time Frame
                        </button>
                      </p>
                      <p className="control">
                        <input
                          className="input"
                          type="number"
                          placeholder="720 ( In minutes )"
                          value={refundTime}
                          onChange={(e) =>
                            setRefundTime(parseInt(e.target.value))
                          }
                        />
                      </p>
                      <p className="control">
                        <button
                          className="button is-link"
                          onClick={() =>
                            changeSetting(refundTime, "refundTime")
                          }
                        >
                          Change
                        </button>
                      </p>
                    </div>
                    <div className="message is-info">
                      <div className="message-body">
                        Please note: Refund time frames must be specified in
                        minutes.
                      </div>
                    </div>
                    <div className="field">
                      <div className="file is-boxed">
                        <label className="file-label">
                          <input
                            className="file-input"
                            type="file"
                            name="resume"
                            onChange={uploadToc}
                          />
                          <span className="file-cta">
                            <span className="file-icon">
                              <Icon path={mdiUpload} />
                            </span>
                            <span className="file-label">
                              {" "}
                              Terms and Conditions
                            </span>
                          </span>
                        </label>
                      </div>
                      <div className="file is-boxed">
                        <label className="file-label">
                          <input
                            className="file-input"
                            type="file"
                            name="resume"
                            onChange={uploadPp}
                          />
                          <span className="file-cta">
                            <span className="file-icon">
                              <Icon path={mdiUpload} />
                            </span>
                            <span className="file-label"> Private Policy</span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="message is-info">
                      <div className="message-body">
                        <strong>Friendly reminder:</strong> When uploading Terms
                        & Privacy documents, ensure they're in HTML format and
                        saved with ".html" extension. Thank you!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;

export const getServerSideProps = (async (ctx) => {
  const settings = await prisma.settings.findMany({
    orderBy: { createdAt: "desc" },
  });
  const setting = JSON.parse(
    JSON.stringify(settings[0])
  ) as (typeof settings)[0];
  return {
    props: { setting },
  };
}) satisfies GetServerSideProps<{}>;

async function uploadFile(file: File, name: string) {
  const formData = new FormData();
  formData.append("tocFile", file);
  try {
    const response = await fetch(`/api/admin/upload?name=${name}`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      console.log("File uploaded successfully");
    } else {
      console.log("Failed to upload file");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}
