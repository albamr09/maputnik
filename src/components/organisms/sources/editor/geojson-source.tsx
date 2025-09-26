import { SourceOnChange } from "@/components/organisms/sources/editor/types";
import { SourceTypeMap } from "@/store/types";

interface GeoJSONSourceEditorProps {
  source: SourceTypeMap["geojson_json"];
  onChange?: SourceOnChange<SourceTypeMap["geojson_json"]>;
}

const GeoJSONSourceEditor: React.FC<GeoJSONSourceEditorProps> = () => {
  return (
    <>
      {/*TODO ALBA GeoJSON data*/}
      {/*TODO ALBA Cluster*/}
    </>
  );
};

export default GeoJSONSourceEditor;
