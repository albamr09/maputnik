import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectModalsState,
  selectMapViewMode,
  toggleModal,
  addInfo,
  clearInfos,
  setMapViewMode,
} from "@/store/slices/uiSlice";
import { redoMessages, undoMessages } from "@/libs/diffmessage";
import useStyleEdition from "@/hooks/useStyleEdition";
import { selectMapStyle } from "@/store/slices/styleSlice";
import useRevisionStore from "@/hooks/useRevisionStore";
import useRefListener from "@/hooks/useRefListener";

const useShortcuts = () => {
  const dispatch = useAppDispatch();

  const mapViewMode = useAppSelector(selectMapViewMode);
  const modalsState = useAppSelector(selectModalsState);
  const mapStyle = useAppSelector(selectMapStyle);

  // Hooks
  const { onStyleChanged } = useStyleEdition();
  const { undo, redo } = useRevisionStore();

  const onUndo = useRefListener(() => {
    const previousStyle = undo();
    if (!previousStyle) return;
    const messages = undoMessages(mapStyle, previousStyle);
    onStyleChanged(previousStyle, { addRevision: false });
    dispatch(clearInfos());
    messages.forEach((info) => dispatch(addInfo(info)));
  }, [mapStyle, onStyleChanged, undo]);

  const onRedo = useRefListener(() => {
    const nextStyle = redo();
    if (!nextStyle) return;
    const messages = redoMessages(mapStyle, nextStyle);
    onStyleChanged(nextStyle, { addRevision: false });
    dispatch(clearInfos());
    messages.forEach((info) => dispatch(addInfo(info)));
  }, [mapStyle, onStyleChanged, redo]);

  // Keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        key: "?",
        handler: () => {
          dispatch(toggleModal("shortcuts"));
        },
      },
      {
        key: "o",
        handler: () => {
          dispatch(toggleModal("import"));
        },
      },
      {
        key: "d",
        handler: () => {
          dispatch(toggleModal("sources"));
        },
      },
      {
        key: "s",
        handler: () => {
          dispatch(toggleModal("metadata"));
        },
      },
      {
        key: "i",
        handler: () => {
          dispatch(setMapViewMode(mapViewMode === "map" ? "inspect" : "map"));
        },
      },
      {
        key: "m",
        handler: () => {
          (
            document.querySelector(".maplibregl-canvas") as HTMLCanvasElement
          ).focus();
        },
      },
      {
        key: "!",
        handler: () => {
          dispatch(toggleModal("debug"));
        },
      },
    ];

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (e.target as HTMLElement).blur();
        document.body.focus();
      } else if (
        modalsState.shortcuts ||
        document.activeElement === document.body
      ) {
        const shortcut = shortcuts.find((shortcut) => {
          return shortcut.key === e.key;
        });

        if (shortcut) {
          dispatch(toggleModal("shortcuts"));
          shortcut.handler();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
        if (e.metaKey && e.shiftKey && e.keyCode === 90) {
          e.preventDefault();
          onRedo.current();
        } else if (e.metaKey && e.keyCode === 90) {
          e.preventDefault();
          onUndo.current();
        }
      } else {
        if (e.ctrlKey && e.keyCode === 90) {
          e.preventDefault();
          onUndo.current();
        } else if (e.ctrlKey && e.keyCode === 89) {
          e.preventDefault();
          onRedo.current();
        }
      }
    };

    document.body.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalsState.shortcuts, mapViewMode, redo]);
};

export default useShortcuts;
