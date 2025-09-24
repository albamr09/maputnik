import { selectSourceType } from "@/libs/source";
import { GeoJSONSourceSpecification, SourceSpecification } from "maplibre-gl";
import { useMemo } from "react";
import GeoJSONURLSource from "@/components/organisms/sources/editor/geojson-url-source";
import { GeoJSONURLSourceSpecification } from "@/store/types";
import GeoJSONSource from "@/components/organisms/sources/editor/geojson-source";

interface SourceEditorProps {
  id: string;
  source: SourceSpecification;
  newSource?: boolean;
}

const SourceEditor: React.FC<SourceEditorProps> = ({
  id,
  source,
  newSource,
}) => {
  const sourceType = useMemo(() => {
    return selectSourceType(source);
  }, [source]);

  switch (sourceType) {
  case "geojson_url":
    return (
      <GeoJSONURLSource
        type={sourceType}
        id={id}
        source={source as GeoJSONURLSourceSpecification}
        newSource={newSource}
      />
    );
  case "geojson_json":
    return (
      <GeoJSONSource
        type={sourceType}
        id={id}
        source={source as GeoJSONSourceSpecification}
        newSource={newSource}
      />
    );
  default:
    return <></>;
  }
};

export default SourceEditor;
