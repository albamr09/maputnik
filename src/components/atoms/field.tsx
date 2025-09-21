import { Label } from "@/components/atoms/label";
import { cn } from "@/libs/shadcn-utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
} from "@/components/atoms/tooltip";

export interface BaseFieldProps<T> {
  value?: T;
  onChange?: (value: T) => void;
}

const labelVariantClasses = {
  default: "",
  secondary: "text-muted-foreground",
};

const sizeDistributionClasses = {
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
  sizeDistribution?: keyof typeof sizeDistributionClasses;
  labelVariant?: keyof typeof labelVariantClasses;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  description,
  className,
  children,
  required = false,
  sizeDistribution = "label-md",
  labelAlignment = "center",
  labelVariant = "default",
}) => {
  return (
    <div className={cn("flex ", className)}>
      <Label
        className={cn(
          "flex text-sm font-medium h-auto gap-1",
          sizeDistributionClasses[sizeDistribution]["label"],
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
                  <Info className="h-3 w-3 text-muted-foreground" />
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
          sizeDistributionClasses[sizeDistribution]["content"],
        )}
      >
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
};
