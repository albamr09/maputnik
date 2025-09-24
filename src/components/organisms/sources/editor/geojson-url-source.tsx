import FieldSelect from "@/components/molecules/field/field-select";
import FieldString from "@/components/molecules/field/field-string";
import {
  GeoJSONURLSourceSpecification,
  SourceTypes,
  SourceTypesType,
} from "@/store/types";
import { useTranslation } from "react-i18next";

interface GeoJSONURLEditorProps {
  id: string;
  type: SourceTypesType;
  source: GeoJSONURLSourceSpecification;
  newSource?: boolean;
}

const GeoJSONURLEditor: React.FC<GeoJSONURLEditorProps> = ({
  id,
  source,
  type,
  newSource = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      {newSource && (
        <FieldString
          label={t("Source ID")}
          description={t(
            "Unique ID that identifies the source and is used in the layer to reference the source.",
          )}
          required
          placeholder={t("Enter here the identifier for you source")}
          value={id}
          onChange={() => {
            // TODO ALBA: do something here
          }}
        />
      )}
      {newSource && (
        <FieldSelect
          label={t("Source Type")}
          description={t("The type of the source.")}
          required
          value={type}
          onChange={() => {
            // TODO ALBA: do something here
          }}
          options={SourceTypes.map((sourceType) => ({
            value: sourceType,
            label: sourceType,
          }))}
        />
      )}
      <FieldString
        label={t("GeoJSON URL")}
        required
        placeholder={t("Enter here the URL")}
        value={source.url}
        onChange={() => {
          // TODO ALBA: do something here
        }}
      />
    </div>
  );
};

export default GeoJSONURLEditor;
