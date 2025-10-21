import { ReactNode } from "react";
import {
	Control,
	ControllerRenderProps,
	FieldValues,
	Path,
	PathValue,
	UseControllerProps,
} from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/atoms/form";

interface FieldFormProps<T extends FieldValues, P extends Path<T>> {
	name: P;
	control: Control<T>;
	rules?: UseControllerProps<T>["rules"];
	children: (field: {
		value: PathValue<T, P>;
		onChange: (v: PathValue<T, P>) => void;
		onBlur: () => void;
	}) => ReactNode;
}

const FieldForm = <T extends FieldValues, P extends Path<T>>({
	name,
	control,
	rules,
	children,
}: FieldFormProps<T, P>) => (
	<FormField
		control={control}
		name={name}
		rules={rules}
		render={({ field }) => (
			<FormItem>
				<FormControl>{children(field)}</FormControl>
				<FormMessage />
			</FormItem>
		)}
	/>
);

export default FieldForm;
