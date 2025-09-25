import FieldString from "@/components/molecules/field/field-string";
import { SourceTypeMap } from "@/store/types";
import { useTranslation } from "react-i18next";
import { SourceOnChange } from "./types";

interface GeoJSONURLEditorProps {
  source: SourceTypeMap["geojson_url"];
  onChange?: SourceOnChange<SourceTypeMap["geojson_url"]>;
}

const GeoJSONURLEditor: React.FC<GeoJSONURLEditorProps> = ({
  source,
  onChange = () => {},
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FieldString
        label={t("GeoJSON URL")}
        required
        placeholder={t("Enter here the URL")}
        value={source.data as string}
        onChange={(value) => {
          onChange("data", value);
        }}
      />
    </>
  );
};

export default GeoJSONURLEditor;
