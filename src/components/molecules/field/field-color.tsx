import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { cn } from "@/lib/utils";

interface FieldColorProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  presetColors?: string[];
}

const FieldColor: React.FC<FieldColorProps> = ({
  label,
  description,
  value,
  onChange,
  error,
  required,
  className,
}) => {
  const handleColorChange = (color: string) => {
    onChange(color);
  };

  return (
    <Field
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="outline"
            className={cn(
              "w-12 h-8 p-1 border border-input",
              error && "border-destructive",
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
