import { ToggleGroup, ToggleGroupItem } from "@/components/atoms/toggle-group";
import { Field } from "@/components/atoms/field";

interface FieldToggleGroupProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  error?: string;
  required?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const FieldToggleGroup: React.FC<FieldToggleGroupProps> = ({
  label,
  description,
  value,
  onChange,
  options,
  error,
  required,
  className,
  orientation = "horizontal",
}) => {
  return (
    <Field
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onChange(newValue);
        }}
        orientation={orientation}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.icon && <span>{option.icon}</span>}
            <span className="capitalize">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
};

export default FieldToggleGroup;
