import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useState } from "react";

interface JSONEditorProps<T> {
	value?: T;
	onChange?: (value: T) => void;
	height?: string;
}

function JSONEditor<T>({
	value,
	onChange = () => {},
	height = "fit-content",
}: JSONEditorProps<T>) {
	const [text, setText] = useState(() => JSON.stringify(value, null, 2));

	const onRawValueChange = useCallback(
		(newValue: string) => {
			setText(newValue);

			// Check JSON validity before calling on change
			try {
				const parsed = JSON.parse(newValue) as T;
				onChange(parsed);
			} catch {}
		},
		[onChange],
	);

	return (
		<CodeMirror
			value={text}
			height={height}
			theme="light"
			extensions={[json(), lintGutter(), linter(jsonParseLinter())]}
			onChange={onRawValueChange}
		/>
	);
}

export default JSONEditor;
