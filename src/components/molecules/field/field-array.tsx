import { Button } from "@/components/atoms/button";
import { Field, FieldProps } from "@/components/atoms/field";
import { Plus, Trash2 } from "lucide-react";
import { ComponentType, useCallback } from "react";
import { FieldNumberProps } from "@/components/molecules/field/field-number";
import { FieldStringProps } from "@/components/molecules/field/field-string";
import { FieldColorProps } from "@/components/molecules/field/field-color";
import { FieldToggleGroupProps } from "@/components/molecules/field/field-toggle-group";

type SupportedFieldProps =
  | FieldNumberProps
  | FieldStringProps
  | FieldColorProps
  | FieldToggleGroupProps;

interface FieldArrayProps<T extends SupportedFieldProps = SupportedFieldProps>
  extends Omit<FieldProps, "children"> {
  value?: T["value"][];
  itemLabels?: string[];
  onChange?: (value: T["value"][]) => void;
  minItems?: number;
  maxItems?: number;
  canAdd?: boolean;
  Component: ComponentType<T>;
  componentProps?: Omit<T, "value" | "onChange">;
  getDefaultValue: () => T["value"];
  emptyMessage?: string;
}

function FieldArray<T extends SupportedFieldProps = SupportedFieldProps>({
  itemLabels,
  value = [],
  onChange = () => {},
  minItems = 0,
  maxItems = Infinity,
  canAdd = true,
  Component,
  componentProps,
  getDefaultValue,
  ...fieldProps
}: FieldArrayProps<T>) {
  const addItem = useCallback(() => {
    if (value.length < maxItems) {
      const newItem = getDefaultValue();
      onChange([...value, newItem]);
    }
  }, [value, onChange, getDefaultValue]);

  const removeItem = useCallback(
    (index: number) => {
      if (value.length > minItems) {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
      }
    },
    [value, onChange],
  );

  const updateItem = useCallback(
    (index: number, newValue: any) => {
      const newArray = [...value];
      newArray[index] = newValue;
      onChange(newArray);
    },
    [value, onChange],
  );

  return (
    <Field labelAlignment="start" {...fieldProps}>
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="size-full">
              {/*@ts-ignore*/}
              <Component
                {...componentProps}
                label={itemLabels?.[index]}
                labelVariant="secondary"
                sizeDistribution={itemLabels ? "label-sm" : "no-label"}
                value={item as T["value"]}
                onChange={(value: T["value"]) => {
                  updateItem(index, value);
                }}
              />
            </div>
            {canAdd && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        {canAdd && (
          <Button
            type="button"
            size="sm"
            onClick={addItem}
            disabled={value.length >= maxItems}
            className="flex"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Field>
  );
}

export default FieldArray;
