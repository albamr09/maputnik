import { useEffect, useRef } from "react";

const useRefListener = <T>(fn: T, deps: any[]) => {
  const fnRef = useRef<T>(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, deps);

  return fnRef;
};

export default useRefListener;

