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
	onChange?: (value: T) => void;
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
}) => {
	const isRow = layoutVariant === "row";

	return (
		<div
			className={cn("flex gap-2", isRow ? "flex-row" : "flex-col", className)}
		>
			<Label
				className={cn(
					"flex text-sm font-medium h-auto gap-1",
					isRow ? rowDistributionClasses[rowDistribution]["label"] : "w-full",
					labelAligmentClasses[labelAlignment],
				)}
			>
				{required && <span className="text-destructive">*</span>}
				<div className="flex gap-1 items-center">
					{label && (
						<span className={cn(labelVariantClasses[labelVariant])}>
							{label}
						</span>
					)}
					{description && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Info className="h-3 w-3 text-slate-400 hover:cursor-help" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									{description}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			</Label>
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
