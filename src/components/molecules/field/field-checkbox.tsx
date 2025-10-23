import { Checkbox } from "@/components/atoms/checkbox";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";

export interface FieldCheckBoxProps
	extends Omit<FieldProps, "children">,
		BaseFieldProps<boolean> {}

const FieldCheckbox: React.FC<FieldCheckBoxProps> = ({
	value,
	defaultValue,
	onChange = () => {},
	onBlur = () => {},
	...fieldProps
}) => {
	return (
		<Field {...fieldProps}>
			<Checkbox
				checked={value}
				// @ts-ignore
				defaultValue={defaultValue}
				onCheckedChange={onChange}
				onBlur={onBlur}
			/>
		</Field>
	);
};

export default FieldCheckbox;
