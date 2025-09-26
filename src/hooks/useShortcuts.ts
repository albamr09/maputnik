import { useEffect } from "react";
import useStyleEdition from "@/hooks/edition/useStyleEdition";
import useRefListener from "@/hooks/useRefListener";
import useRevisionStore from "@/hooks/useRevisionStore";
import { redoMessages, undoMessages } from "@/libs/diffmessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectMapStyle } from "@/store/slices/styleSlice";
import {
	addInfo,
	clearInfos,
	selectMapViewMode,
	selectModalOpenName,
	setMapViewMode,
	toggleModal,
} from "@/store/slices/uiSlice";

const useShortcuts = () => {
	const dispatch = useAppDispatch();

	const mapViewMode = useAppSelector(selectMapViewMode);
	const modalOpenName = useAppSelector(selectModalOpenName);
	const mapStyle = useAppSelector(selectMapStyle);

	// Hooks
	const { setMapStyle } = useStyleEdition();
	const { undo, redo } = useRevisionStore();

	const onUndo = useRefListener(() => {
		const previousStyle = undo();
		if (!previousStyle) return;
		const messages = undoMessages(mapStyle, previousStyle);
		setMapStyle(previousStyle, { addRevision: false });
		dispatch(clearInfos());
		messages.forEach((info) => dispatch(addInfo(info)));
	}, [mapStyle, setMapStyle, undo]);

	const onRedo = useRefListener(() => {
		const nextStyle = redo();
		if (!nextStyle) return;
		const messages = redoMessages(mapStyle, nextStyle);
		setMapStyle(nextStyle, { addRevision: false });
		dispatch(clearInfos());
		messages.forEach((info) => dispatch(addInfo(info)));
	}, [mapStyle, setMapStyle, redo]);

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
				modalOpenName == "shortcuts" ||
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
	}, [modalOpenName, mapViewMode, redo]);
};

export default useShortcuts;
