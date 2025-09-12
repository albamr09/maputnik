import { Input } from "@/components/atoms/input";
import { Field } from "@/components/atoms/field";

interface FieldStringProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const FieldString: React.FC<FieldStringProps> = ({
  label,
  value,
  onChange,
  description,
  placeholder,
  error,
  required,
  className,
}) => {
  return (
    <Field
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />
    </Field>
  );
};

export default FieldString;
