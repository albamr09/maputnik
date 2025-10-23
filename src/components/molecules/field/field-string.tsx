import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";

export interface FieldStringProps
	extends Omit<FieldProps, "children">,
		BaseFieldProps<string> {
	placeholder?: string;
}

const FieldString: React.FC<FieldStringProps> = ({
	value,
  defaultValue,
	onChange = () => {},
	onBlur = () => {},
	placeholder,
	...fieldProps
}) => {
	return (
		<Field {...fieldProps}>
			<Input
				value={value}
        defaultValue={defaultValue}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				placeholder={placeholder}
				className={fieldProps.error ? "border-destructive" : ""}
			/>
		</Field>
	);
};

export default FieldString;
