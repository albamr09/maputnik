import { useTranslation } from "react-i18next";
import { SourceOnChange } from "./types";
import { SourceTypeMap } from "@/store/types";

interface GeoJSONSourceEditorProps {
  source: SourceTypeMap["geojson_json"];
  onChange?: SourceOnChange<SourceTypeMap["geojson_json"]>;
}

const GeoJSONSourceEditor: React.FC<GeoJSONSourceEditorProps> = ({
  source,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/*TODO ALBA GeoJSON data*/}
      {/*TODO ALBA Cluster*/}
    </>
  );
};

export default GeoJSONSourceEditor;
