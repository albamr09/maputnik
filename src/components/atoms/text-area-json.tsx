import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useMemo } from "react";

interface JSONTextAreaProps<T> {
	value?: T;
	onChange?: (value: T) => void;
	placeHoder?: string;
	height?: string;
	maxHeight?: string;
}

function JSONTextArea<T>({
	value,
	placeHoder,
	onChange = () => {},
	height = "fit-content",
	maxHeight = "fit-content",
}: JSONTextAreaProps<T>) {
	const stringValue = useMemo(() => {
		return JSON.stringify(value ?? placeHoder, null, 2);
	}, [value, placeHoder]);

	const onRawValueChange = useCallback(
		(newValue: string) => {
			// Check JSON validity before calling on change
			try {
				const parsed = JSON.parse(newValue) as T;
				onChange(parsed);
			} catch {
				console.warn(`Could not parse JSON ${newValue}`);
			}
		},
		[onChange],
	);

	return (
		<CodeMirror
			value={stringValue}
			height={height}
			maxHeight={maxHeight}
			// The combination of these values make the
			// width adapt to the parent
			minWidth="stretch"
			maxWidth="0px"
			theme="light"
			extensions={[json(), lintGutter(), linter(jsonParseLinter())]}
			onChange={onRawValueChange}
		/>
	);
}

export default JSONTextArea;
