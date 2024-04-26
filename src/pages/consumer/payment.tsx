import Navbar3 from "@/components/consumer/Navbar3";
import React, { FC, useState } from "react";
import { useQRCode } from "next-qrcode";
import SimpleInput from "@/components/SimpleInput";
import { isString } from "util";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import prisma from "@/lib/prisma-client";
import { GuardLib } from "@/lib/guard";
import { PaymentType } from "@/constants";
import { UtilLib } from "@/lib/util";
import { ConsumerServices } from "@/services/consumer";
import { getCookie, hasCookie } from "cookies-next";

const qrCode =
  "00020101021202021110500346KBZ00dfed8b78d48a378131f3e455d5be1f8f021344397294600062000100732kp5584cb34dce840f1a81f563588940150200006KBZPay0106KBZPay5303MMK5802MM62170813PAY_BY_QRCODE64060002my630426F2&integrity=bc9e35b5e7b0ae13f3d021200edfd06c825e36f24db55397419f214b2549d19f";
const placeHolderImage = "https://placehold.co/72x48";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Payment: FC<Props> = ({ amountDue, seatsIds }) => {
  const [paymentType, setPaymentType] = useState<PaymentType>();
  const isKbzPay = paymentType === PaymentType.KBZPAY;
  const isMpu = paymentType === PaymentType.MPU;
  const confirmPayment = () => {
    if (!hasCookie("ccid")) {
      throw new Error("Missing 'ccid' cookie for data entry.");
    }
    const ccid = getCookie("ccid")!;
    ConsumerServices.book(ccid, seatsIds);
  };
  return (
    <>
      <Navbar3 />
      <section className="section">
        <div className="field">
          <span>By continuing, you agree to the </span>
          <a href="#">terms and conditions</a>.
        </div>
        <ChoosePaymentType setPaymentType={setPaymentType} />
        <hr />
        <div className="field">
          <p className="">Amount Due</p>
          <span className="is-size-4 has-text-success-50 has-text-weight-medium">
            {amountDue.toString().concat(" MMK")}
          </span>
        </div>
        {isKbzPay && <KbzPaymentView />}
        {isMpu && <MpuPaymentView confirmPayment={confirmPayment} />}
      </section>
    </>
  );
};
export const getServerSideProps = (async ({ query }) => {
  const contextQuery = query.context;
  if (!isString(contextQuery))
    throw new Error(
      "Invalid or missing request query parameter(s): [context]."
    );
  const context = UtilLib.decodeContext(contextQuery);
  if (!GuardLib.isStringArray(context))
    throw new Error(
      "Invalid or missing request query parameter(s): [context]."
    );
  const result = await prisma.seat.findMany({
    where: { id: { in: context } },
    orderBy: { id: "desc" },
    select: { id: true, trip: { select: { price: true } } },
  });

  const seatsIds = result.map((s) => s.id);
  const amountDue = result[0].trip.price.times(result.length).toNumber();

  return {
    props: {
      amountDue,
      seatsIds,
    },
  };
}) satisfies GetServerSideProps<{
  amountDue: number;
  seatsIds: string[];
}>;

const ChoosePaymentType: FC<{
  setPaymentType: (type: PaymentType) => void;
}> = ({ setPaymentType }) => {
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentType(e.target.value as PaymentType);
  };
  return (
    <>
      <p className="subtitle is-6">Select Payment Type</p>
      <div className="control">
        <label className="radio">
          <input
            type="radio"
            name="rsvp"
            value={PaymentType.MPU}
            onChange={handleOptionChange}
          />
          <span> MPU</span>
        </label>
        <label className="radio">
          <input
            type="radio"
            name="rsvp"
            value={PaymentType.KBZPAY}
            onChange={handleOptionChange}
          />
          <span> KBZ Pay</span>
        </label>
        <label className="radio">
          <input
            type="radio"
            name="rsvp"
            value={PaymentType.VISA}
            onChange={handleOptionChange}
          />
          <span> Visa</span>
        </label>
      </div>
    </>
  );
};

const KbzPaymentView = () => {
  const { Canvas } = useQRCode();
  return (
    <div>
      <div className="field">
        <Canvas text={qrCode} />
      </div>
      <div className="field">
        <button className="button is-white is-large is-loading is-shadowless"></button>
        <p> Awaiting payment</p>
      </div>
      <div className="field">
        <span>Please scan QR code with your wallet app.</span>
      </div>
    </div>
  );
};

const MpuPaymentView: FC<{ confirmPayment: VoidFunction }> = ({
  confirmPayment,
}) => {
  return (
    <div>
      <form action="">
        <SimpleInput
          type={"text"}
          label="Card Number"
          placeholder="5555 5555 5555 4444"
        />
        <SimpleInput
          type={"text"}
          label="Name on Card"
          placeholder="John Doe"
        />
        <div className="field mb-0 is-grouped">
          <SimpleInput
            type={"text"}
            label="Expiration Date"
            placeholder="MM/YY"
          />
          <SimpleInput
            type={"text"}
            label="Security Code"
            placeholder="CVV/CVC"
          />
        </div>
        <div className="field">
          <label className="label">Enter OTP</label>
          <div className="field has-addons">
            <div className="control">
              <input type="text" className="input" placeholder="123456" />
            </div>
            <div className="control">
              <button className="button is-link is-flex-grow-0">Get OTP</button>
            </div>
          </div>
        </div>
        <hr />
        <div className="buttons">
          <div className="button">Cancel</div>
          <div className="button is-link" onClick={confirmPayment}>
            Confirm Payment
          </div>
        </div>
      </form>
    </div>
  );
};

export default Payment;
