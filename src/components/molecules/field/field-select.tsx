import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

export interface FieldSelectProps
  extends Omit<FieldProps, "children">,
    BaseFieldProps<string> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const FieldSelect: React.FC<FieldSelectProps> = ({
  value,
  options,
  onChange = () => {},
  placeholder,
  ...fieldProps
}) => {
  return (
    <Field {...fieldProps}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              <span className="capitalize">{label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

export default FieldSelect;
