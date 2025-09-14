import { Input } from "@/components/atoms/input";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";

export interface FieldStringProps
  extends Omit<FieldProps, "children">,
    BaseFieldProps<string> {
  placeholder?: string;
}

const FieldString: React.FC<FieldStringProps> = ({
  value,
  onChange = () => {},
  placeholder,
  ...fieldProps
}) => {
  return (
    <Field {...fieldProps}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldProps.error ? "border-destructive" : ""}
      />
    </Field>
  );
};

export default FieldString;
