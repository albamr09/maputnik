import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";

export interface FieldNumberProps
	extends Omit<FieldProps, "children">,
		BaseFieldProps<number> {
	min?: number;
	max?: number;
	step?: number;
}

const FieldNumber: React.FC<FieldNumberProps> = ({
	value,
	onChange = () => {},
	min,
	max,
	step,
	...fieldProps
}) => {
	return (
		<Field {...fieldProps}>
			<Input
				type="number"
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				min={min}
				max={max}
				step={step}
				className={fieldProps.error ? "border-destructive" : ""}
			/>
		</Field>
	);
};

export default FieldNumber;
