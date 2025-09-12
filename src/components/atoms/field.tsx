import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
} from "@/components/atoms/tooltip";

interface FieldProps {
  label: string;
  error?: string | null;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  description,
  required = false,
  className,
  children,
}) => {
  return (
    <div className={cn("flex items-start space-x-4", className)}>
      <Label className="text-sm font-medium w-1/3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {label && <span>{label}</span>}
          {required && <span className="text-destructive">*</span>}
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </Label>
      <div className="w-2/3">
        {children}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
};
