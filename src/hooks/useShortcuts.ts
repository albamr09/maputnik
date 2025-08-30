import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectIsModalOpen,
  selectMapViewMode,
  setMapState,
  toggleModal,
} from "../store/slices/uiSlice";
import { addInfo, clearInfos } from "../store/slices/errorsSlice";
import { redoMessages, undoMessages } from "../libs/diffmessage";
import useStyleEdition from "./useStyleEdition";
import { selectMapStyle } from "../store/slices/styleSlice";

const useShortcuts = () => {
  const dispatch = useAppDispatch();

  const mapViewMode = useAppSelector(selectMapViewMode);
  const isOpen = useAppSelector(selectIsModalOpen);
  const mapStyle = useAppSelector(selectMapStyle);

  // Hooks
  const { onStyleChanged } = useStyleEdition();

  // TODO ALBA: redo/undo functionality is probably a hook on itself
  const onUndo = useCallback(() => {
    // TODO ALBA: restore this
    // const activeStyle = revisionStoreRef.current?.undo();
    // if (!activeStyle) return;
    // const messages = undoMessages(mapStyle, activeStyle);
    // onStyleChanged(activeStyle, { addRevision: false });
    // dispatch(clearInfos());
    // messages.forEach(info => dispatch(addInfo(info)));
  }, [mapStyle, onStyleChanged, dispatch]);

  const onRedo = useCallback(() => {
    // TODO ALBA: restore this
    // const activeStyle = revisionStoreRef.current?.redo();
    // if (!activeStyle) return;
    // const messages = redoMessages(mapStyle, activeStyle);
    // onStyleChanged(activeStyle, { addRevision: false });
    // dispatch(clearInfos());
    // messages.forEach(info => dispatch(addInfo(info)));
  }, [mapStyle, onStyleChanged, dispatch]);

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
          dispatch(toggleModal("open"));
        },
      },
      {
        key: "e",
        handler: () => {
          dispatch(toggleModal("export"));
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
          dispatch(toggleModal("settings"));
        },
      },
      {
        key: "i",
        handler: () => {
          dispatch(setMapState(mapViewMode === "map" ? "inspect" : "map"));
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
      } else if (isOpen.shortcuts || document.activeElement === document.body) {
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
          onRedo();
        } else if (e.metaKey && e.keyCode === 90) {
          e.preventDefault();
          onUndo();
        }
      } else {
        if (e.ctrlKey && e.keyCode === 90) {
          e.preventDefault();
          onUndo();
        } else if (e.ctrlKey && e.keyCode === 89) {
          e.preventDefault();
          onRedo();
        }
      }
    };

    document.body.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, isOpen.shortcuts, mapViewMode]);
};

export default useShortcuts;

