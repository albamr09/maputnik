import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";

export interface Option<Value extends string> {
	value: Value;
	label: string;
}

export interface FieldSelectProps<Value extends string>
	extends Omit<FieldProps, "children">,
		BaseFieldProps<Value> {
	options: Option<Value>[];
	placeholder?: string;
}

const FieldSelect = <Value extends string>({
	value,
	options,
	onChange = () => {},
	onBlur = () => {},
	placeholder,
	...fieldProps
}: FieldSelectProps<Value>) => {
	return (
		<Field {...fieldProps}>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger className="w-[180px]" onBlur={onBlur}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map(({ value: optValue, label }) => (
						<SelectItem key={optValue} value={optValue}>
							<span className="capitalize">{label}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
};

export default FieldSelect;
