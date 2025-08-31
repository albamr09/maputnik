import { useCallback } from "react";
import type { StyleSpecification } from "maplibre-gl";
import { ExtendedStyleSpecification } from "../store/types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { appendRevision, setRevisions, selectRevisions, selectRevisionCurrentIdx, setCurrentRevisionIdx } from "../store/slices/styleStoreSlice";

const useRevisionStore = () => {
  const dispatch = useAppDispatch();
  const revisions = useAppSelector(selectRevisions);
  const currentRevisionIdx = useAppSelector(selectRevisionCurrentIdx);

  const addRevision = useCallback(
    (revision: ExtendedStyleSpecification) => {
      dispatch(appendRevision(revision));
    },
    []
  );

  const undo = useCallback(() => {
    if (currentRevisionIdx > 0) {
      const newIndex = currentRevisionIdx - 1;
      dispatch(setCurrentRevisionIdx(newIndex));
      return revisions[newIndex];
    }
    return null;
  }, [revisions.length, currentRevisionIdx]);

  const redo = useCallback(() => {
    if (currentRevisionIdx < revisions.length - 1) {
      const newIndex = currentRevisionIdx + 1;
      dispatch(setCurrentRevisionIdx(newIndex));
      return revisions[newIndex]
    }
    return null;
  }, [currentRevisionIdx, revisions.length]);

  const reset = useCallback(
    (newRevisions: (StyleSpecification & { id: string })[] = []) => {
      dispatch(setRevisions(newRevisions));
    },
    []
  );

  return {
    revisions,
    addRevision,
    undo,
    redo,
    reset,
  };
};

export default useRevisionStore;
