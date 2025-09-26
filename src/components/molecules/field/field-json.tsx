import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import JSONEditor from "@/components/molecules/input/json-editor";

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
		<Field labelAlignment="start" {...fieldProps}>
			<JSONEditor<T> value={value} onChange={onChange} />
		</Field>
	);
}

export default FieldJSON;
