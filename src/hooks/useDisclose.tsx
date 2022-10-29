import { useMemo, useState } from "react";

export type DiscloseHook = [boolean, () => void, () => void, () => void];

function useDisclose(initialState = false): DiscloseHook {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  const toggle = () => setIsOpen(!isOpen);

  const resArray: DiscloseHook = [isOpen, open, close, toggle];

  return useMemo<DiscloseHook>(() => resArray, resArray);
}

export default useDisclose;
