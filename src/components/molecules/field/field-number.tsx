import { Input } from "@/components/atoms/input";
import { Field } from "@/components/atoms/field";

interface FieldNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
}

const FieldNumber: React.FC<FieldNumberProps> = ({
  label,
  value,
  description,
  onChange,
  min,
  max,
  step,
  error,
  required,
  className,
}) => {
  return (
    <Field
      label={label}
      error={error}
      required={required}
      description={description}
      className={className}
    >
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={error ? "border-destructive" : ""}
      />
    </Field>
  );
};

export default FieldNumber;
