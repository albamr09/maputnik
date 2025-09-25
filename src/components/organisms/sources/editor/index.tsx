import { SourceTypeMap, SourceTypesType } from "@/store/types";
import GeoJSONURLEditor from "./geojson-url-source";
import GeoJSONSourceEditor from "./geojson-source";
import { SourceOnChange } from "./types";

interface SourceEditorProps<K extends SourceTypesType> {
  sourceType: K;
  source: SourceTypeMap[K];
  onChange: SourceOnChange<SourceTypeMap[K]>;
}

const SourceEditor = <K extends SourceTypesType>({
  source,
  sourceType,
  onChange,
}: SourceEditorProps<K>) => {
  if (sourceType === "geojson_url") {
    return (
      <GeoJSONURLEditor
        source={source as SourceTypeMap["geojson_url"]}
        onChange={onChange as SourceOnChange<SourceTypeMap["geojson_url"]>}
      />
    );
  }

  if (sourceType === "geojson_json") {
    return (
      <GeoJSONSourceEditor
        source={source as SourceTypeMap["geojson_json"]}
        onChange={onChange as SourceOnChange<SourceTypeMap["geojson_json"]>}
      />
    );
  }

  return null;
};

export default SourceEditor;
