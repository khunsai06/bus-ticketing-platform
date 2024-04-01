import { useState, useEffect } from "react";
import { ZodError, ZodSchema } from "zod";

type State = string;
type Params = {
  initialValue: State;
  zodSchema: ZodSchema<State>;
};

export default function useField({ initialValue, zodSchema }: Params) {
  const [value, setValue] = useState<State>(initialValue);
  const [isValidationAllowed, setIsValidationAllowed] =
    useState<boolean>(false);
  const [validity, setValidity] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!isValidationAllowed) return;
    try {
      zodSchema.parse(value);
      setValidity(true);
      setMessage(undefined);
    } catch (error) {
      if (error instanceof ZodError) {
        setValidity(false);
        setMessage(error.errors[0].message);
      } else {
        throw error;
      }
    }
  }, [value, isValidationAllowed]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setValue(e.target.value);

  const reset = () => {
    setValue("");
    setMessage("");
    setValidity(false);
    setIsValidationAllowed(false);
  };

  const setMockValue = (newValue: State) => {
    setIsValidationAllowed(true);
    setValue(newValue);
  };
  const onFocus = () => setIsValidationAllowed(true);
  const validate = () => setIsValidationAllowed(true);

  return {
    value,
    validity,
    message,
    onChange,
    onFocus,
    setMockValue,
    validate,
    reset,
  };
}
