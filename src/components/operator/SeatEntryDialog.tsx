import useField from "@/hooks/useField";
import { UtilLib } from "@/lib/util";
import { requiredSchema } from "@/lib/zod-schema";
import { OperatorServices } from "@/services/operator";
import React from "react";
import SimpleInput from "../SimpleInput";
import { z } from "zod";
import SimpleTextArea from "../SimpleTextArea";

type Props = {
  tripId: string;
  active: boolean;
  closeDialog: VoidFunction;
  refresh: VoidFunction;
};

const SeatEntryDialog: React.FC<Props> = ({
  tripId,
  active,
  closeDialog,
  refresh,
}) => {
  const seatNumbFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });
  const seatLocFieldCtrl = useField({
    initialValue: "",
    zodSchema: requiredSchema,
  });
  const seatFeatsFieldCtrl = useField({
    initialValue: "",
    zodSchema: z.string(),
  });
  const seatAddlFieldCtrl = useField({
    initialValue: "",
    zodSchema: z.string(),
  });
  const handleSeatEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    seatNumbFieldCtrl.validate();
    seatLocFieldCtrl.validate();
    if (!seatNumbFieldCtrl.validity || !seatLocFieldCtrl.validity) return;
    const number = seatNumbFieldCtrl.value;
    const location = seatLocFieldCtrl.value;
    const features = seatFeatsFieldCtrl.value;
    const additional = seatAddlFieldCtrl.value;
    const data = { number, location, features, additional };
    const res = await OperatorServices.SeatManager.create(tripId, data);
    await UtilLib.handleFetchResponse(res, {
      successCallBack(data) {
        refresh();
        seatNumbFieldCtrl.reset();
        seatLocFieldCtrl.reset();
        seatFeatsFieldCtrl.reset();
        seatAddlFieldCtrl.reset();
        closeDialog();
      },
      errCallback: console.error,
    });
  };

  return (
    <div className={`modal ${active ? "is-active" : ""}`} id="modal-js-example">
      <div className="modal-background" onClick={closeDialog}></div>
      <div className="modal-card">
        <div className="modal-card-head">
          <p className="modal-card-title">Seat Entry Form</p>
          <button
            className="delete"
            aria-label="close"
            onClick={closeDialog}
          ></button>
        </div>
        <form onSubmit={handleSeatEntry}>
          <div className="modal-card-body">
            <SimpleInput
              label="Seat Number*"
              type="text"
              value={seatNumbFieldCtrl.value}
              onChange={seatNumbFieldCtrl.onChange}
              onFocus={seatNumbFieldCtrl.onFocus}
              help={
                !seatNumbFieldCtrl.validity
                  ? seatNumbFieldCtrl.message
                  : undefined
              }
            />
            <SimpleInput
              label="Seat Location*"
              type="text"
              value={seatLocFieldCtrl.value}
              onChange={seatLocFieldCtrl.onChange}
              onFocus={seatLocFieldCtrl.onFocus}
              help={
                !seatLocFieldCtrl.validity
                  ? seatLocFieldCtrl.message
                  : undefined
              }
            />
            <SimpleTextArea
              label="Seat Features"
              rows={2}
              placeholder="Enter seat features separated by commas (e.g., foo, bar, baz)"
              value={seatFeatsFieldCtrl.value}
              onChange={seatFeatsFieldCtrl.onChange}
              onFocus={seatFeatsFieldCtrl.onFocus}
            />
            <SimpleTextArea
              label="Additional"
              rows={2}
              value={seatAddlFieldCtrl.value}
              onChange={seatAddlFieldCtrl.onChange}
              onFocus={seatAddlFieldCtrl.onFocus}
            />
          </div>
          <div className="modal-card-foot">
            <div className="buttons">
              <button type="reset" className="button" onClick={closeDialog}>
                Cancel
              </button>
              <button type="submit" className="button is-link">
                Add
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeatEntryDialog;
