import { Button } from "@/components/atoms/button";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import { cn } from "@/libs/shadcn-utils";

export interface FieldColorProps
	extends Omit<FieldProps, "children">,
		BaseFieldProps<string> {}

const FieldColor: React.FC<FieldColorProps> = ({
	value,
	onChange = () => {},
	onBlur = () => {},
	...fieldProps
}) => {
	const handleColorChange = (color: string) => {
		onChange(color);
	};

	return (
		<Field {...fieldProps}>
			<div className="flex items-center gap-2" onBlur={onBlur}>
				<div className="relative">
					<Button
						variant="outline"
						className={cn(
							"w-12 h-8 p-1 border border-input",
							fieldProps.error && "border-destructive",
						)}
					>
						<div
							className="w-full h-full rounded-sm"
							style={{ backgroundColor: value }}
						/>
					</Button>

					<input
						type="color"
						value={value}
						onChange={(e) => handleColorChange(e.target.value)}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
				</div>

				<span className="text-sm text-muted-foreground font-mono">{value}</span>
			</div>
		</Field>
	);
};

export default FieldColor;
