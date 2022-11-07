import { useLayoutEffect, useState } from "react";
import { useResizeObserverRef } from "rooks";

const useSize = (target: any) => {
  const [size, setSize] = useState(0);
  const [ref] = useResizeObserverRef((entry) =>
    setSize(entry[0].contentRect.height)
  );

  useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens

  return size;
};

export default useSize;
