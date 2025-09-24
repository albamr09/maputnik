import { selectSourceType } from "@/libs/source";
import { SourceSpecification } from "maplibre-gl";
import { useMemo } from "react";
import GeoJSONURLEditor from "@/components/organisms/sources/editor/geojson-url-editor";
import { GeoJSONURLSourceSpecification } from "@/store/types";

interface SourceEditorProps {
  id: string;
  source: SourceSpecification;
}

const SourceEditor: React.FC<SourceEditorProps> = ({ id, source }) => {
  const sourceType = useMemo(() => {
    return selectSourceType(source);
  }, [source]);

  switch (sourceType) {
  case "geojson_url":
    return (
      <GeoJSONURLEditor
        type={sourceType}
        id={id}
        source={source as GeoJSONURLSourceSpecification}
      />
    );
  case "geojson_json":
    return <></>;
  default:
    return <></>;
  }
};

export default SourceEditor;
