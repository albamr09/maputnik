import { ToggleGroup, ToggleGroupItem } from "@/components/atoms/toggle-group";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";

export interface FieldToggleGroupProps
  extends Omit<FieldProps, "children">,
    BaseFieldProps<string> {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  orientation?: "horizontal" | "vertical";
}

const FieldToggleGroup: React.FC<FieldToggleGroupProps> = ({
  value,
  onChange = () => {},
  options,
  orientation = "horizontal",
  ...fieldProps
}) => {
  return (
    <Field {...fieldProps}>
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
