import { SourceTypesType } from "@/store/types";
import type { SourceSpecification } from "maplibre-gl";

export const getSourceType = (
  source: SourceSpecification,
): SourceTypesType | null => {
  if (source.type === "raster") {
    if (source.tiles) return "tile_raster";
    return "tilejson_raster";
  }
  if (source.type === "raster-dem") {
    if (source.tiles) return "tilexyz_raster-dem";
    return "tilejson_raster-dem";
  }
  if (source.type === "vector") {
    if (source.tiles) return "tile_vector";
    if (source.url && source.url.startsWith("pmtiles://"))
      return "pmtiles_vector";
    return "tilejson_vector";
  }
  if (source.type === "geojson") {
    if (typeof source.data === "string") {
      return "geojson_url";
    } else {
      return "geojson_json";
    }
  }
  if (source.type === "image") {
    return "image";
  }
  if (source.type === "video") {
    return "video";
  }

  return null;
};
