// src/components/molecules/field/field-array.tsx
import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Plus, Trash2 } from "lucide-react";
import { ComponentType } from "react";

interface FieldArrayProps<T = any> {
  label: string;
  description?: string;
  value: T[];
  onChange: (value: T[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
  variant?: "vertical" | "horizontal";
  minItems?: number;
  maxItems?: number;
  FieldComponent: ComponentType<any>;
  fieldProps?: Record<string, any>;
  getDefaultValue: () => T;
  emptyMessage?: string;
}

const FieldArray: React.FC<FieldArrayProps> = ({
  label,
  description,
  value,
  onChange,
  error,
  required,
  className,
  minItems = 0,
  maxItems = Infinity,
  FieldComponent,
  fieldProps = {},
  getDefaultValue,
  emptyMessage = "No items added yet",
}) => {
  const addItem = () => {
    if (value.length < maxItems) {
      const newItem = getDefaultValue();
      onChange([...value, newItem]);
    }
  };

  const removeItem = (index: number) => {
    if (value.length > minItems) {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);
    }
  };

  const updateItem = (index: number, newValue: any) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };

  return (
    <Field
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <div className="space-y-2">
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-2">
            {emptyMessage}
          </p>
        ) : (
          value.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <FieldComponent
                  value={item}
                  onChange={(newValue: any) => updateItem(index, newValue)}
                  {...fieldProps}
                />
              </div>
              {minItems != maxItems && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={value.length <= minItems}
                  className="h-8 w-8 p-0 shrink-0 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              {index === value.length - 1 && minItems != maxItems && (
                <Button
                  type="button"
                  size="sm"
                  onClick={addItem}
                  disabled={value.length >= maxItems}
                  className="ml-auto"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Field>
  );
};

export default FieldArray;
