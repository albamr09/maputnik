import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import { Switch } from "@/components/atoms/switch";

export interface FieldSwitchProps
	extends Omit<FieldProps, "children">,
		BaseFieldProps<boolean> {}

const FieldSwitch: React.FC<FieldSwitchProps> = ({
	value,
	defaultValue,
	onChange = () => {},
	onBlur = () => {},
	...fieldProps
}) => {
	return (
		<Field {...fieldProps}>
			<Switch
				checked={value}
				// @ts-ignore
				defaultValue={defaultValue}
				onCheckedChange={onChange}
				onBlur={onBlur}
			/>
		</Field>
	);
};

export default FieldSwitch;
