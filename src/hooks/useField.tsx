import { useState, useEffect } from "react";
import { ZodError, ZodSchema } from "zod";

type State = string;
type Params = {
  initialValue: State;
  zodSchema: ZodSchema<State>;
  onError?: (e: ZodError) => void;
};

export default function useField({ initialValue, zodSchema, onError }: Params) {
  const [value, setValue] = useState<State>(initialValue);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [validity, setValidity] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!isFocus) return;
    try {
      zodSchema.parse(value);
      setValidity(true);
      setMessage(undefined);
    } catch (error) {
      if (error instanceof ZodError) {
        onError?.(error);
        setValidity(false);
        setMessage(error.errors[0].message);
      } else {
        throw error;
      }
    }
  }, [value, isFocus]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setValue(e.target.value);

  const reset = () => {
    setValue("");
    setIsFocus(false);
    setValidity(false);
    setMessage("");
  };

  const onFocus = () => setIsFocus(true);
  const validate = () => setIsFocus(true);

  return {
    value,
    isFocus,
    validity,
    message,
    setValue,
    validate,
    reset,
    onChange,
    onFocus,
  };
}
