import { Info } from "lucide-react";
import { Label } from "@/components/atoms/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { cn } from "@/libs/shadcn-utils";

export interface BaseFieldProps<T> {
	value?: T;
  defaultValue?: T;
	onChange?: (value: T) => void;
	onBlur?: () => void;
}

const labelVariantClasses = {
	default: "",
	secondary: "text-muted-foreground",
};

const rowDistributionClasses = {
	equal: {
		label: "w-1/2",
		content: "w-1/2",
	},
	"label-sm": {
		label: "w-1/5",
		content: "w-4/5",
	},
	"label-md": {
		label: "w-1/3",
		content: "w-2/3",
	},
	"label-lg": {
		label: "w-2/3",
		content: "w-1/3",
	},
	"no-label": {
		label: "w-0",
		content: "w-full",
	},
};

const labelAligmentClasses = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
};

export interface FieldProps {
	label: string;
	error?: string | null;
	description?: string;
	required?: boolean;
	className?: string;
	children: React.ReactNode;
	labelAlignment?: keyof typeof labelAligmentClasses;
	rowDistribution?: keyof typeof rowDistributionClasses;
	labelVariant?: keyof typeof labelVariantClasses;
	layoutVariant?: "row" | "column";
	trailingButtons?: React.ReactNode[] | React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
	label,
	error,
	description,
	className,
	children,
	required = false,
	rowDistribution = "label-md",
	labelAlignment = "center",
	labelVariant = "default",
	layoutVariant = "row",
	trailingButtons = undefined,
}) => {
	const isRow = layoutVariant === "row";
	const showLabel = rowDistribution !== "no-label";

	return (
		<div
			className={cn("flex gap-2", isRow ? "flex-row" : "flex-col", className)}
		>
			{showLabel && (
				<div
					className={cn(
						"flex h-auto gap-1 justify-between items-center",
						isRow ? rowDistributionClasses[rowDistribution]["label"] : "w-full",
						labelAligmentClasses[labelAlignment],
					)}
				>
					<Label className="flex text-sm font-medium gap-1">
						{required && <span className="text-destructive">*</span>}
						{label && (
							<span className={cn(labelVariantClasses[labelVariant])}>
								{label}
							</span>
						)}
						{description && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info className="h-2.5 w-2.5 text-slate-400 hover:cursor-help" />
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										{description}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</Label>
					{trailingButtons}
				</div>
			)}
			<div
				className={cn(
					"flex flex-col gap-2",
					isRow ? rowDistributionClasses[rowDistribution]["content"] : "w-full",
				)}
			>
				{children}
				{error && <p className="text-xs text-destructive">{error}</p>}
			</div>
		</div>
	);
};
