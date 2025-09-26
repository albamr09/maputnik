import { Checkbox } from "@/components/atoms/checkbox";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";

export interface FieldCheckBoxProps
	extends Omit<FieldProps, "children">,
		BaseFieldProps<boolean> {}

const FieldCheckbox: React.FC<FieldCheckBoxProps> = ({
	value,
	onChange = () => {},
	...fieldProps
}) => {
	return (
		<Field {...fieldProps}>
			<Checkbox checked={value} onCheckedChange={onChange} />
		</Field>
	);
};

export default FieldCheckbox;
