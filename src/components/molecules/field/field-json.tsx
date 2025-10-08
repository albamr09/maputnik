import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import JSONTextArea from "@/components/atoms/text-area-json";

export interface FieldJSONProps<T>
	extends Omit<FieldProps, "children">,
		BaseFieldProps<T> {
	placeholder?: string;
}

function FieldJSON<T>({
	value,
	onChange = () => {},
	placeholder,
	...fieldProps
}: FieldJSONProps<T>) {
	return (
		<Field labelAlignment="start" layoutVariant="column" {...fieldProps}>
			<JSONTextArea<T> value={value} placeHoder={placeholder} onChange={onChange} />
		</Field>
	);
}

export default FieldJSON;
