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
        {options.map(({ value, label, icon }) => (
          <ToggleGroupItem key={value} value={value}>
            {icon && <span>{icon}</span>}
            <span className="capitalize">{label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
};

export default FieldToggleGroup;
