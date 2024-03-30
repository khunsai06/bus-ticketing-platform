import { useState } from "react";

function useSwitch(initialState = false) {
  const [value, setValue] = useState(initialState);

  const open = () => setValue(true);
  const close = () => setValue(false);
  const toggle = () => setValue(!value);

  return { value, open, close, toggle };
}

export default useSwitch;
