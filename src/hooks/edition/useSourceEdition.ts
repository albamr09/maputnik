import { useCallback } from "react";
import useStyleEdition from "./useStyleEdition";

const useSourceEdition = () => {
  const { patchMapStyle } = useStyleEdition();

  const deleteSource = useCallback(
    (id: string) => {
      patchMapStyle({ sources: { [id]: undefined } });
    },
    [patchMapStyle],
  );

  return { deleteSource };
};

export default useSourceEdition;
