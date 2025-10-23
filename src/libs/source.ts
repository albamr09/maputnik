import type { SourceSpecification } from "maplibre-gl";
import { SourceTypesType } from "@/store/types";

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

export const getTypeFromSourceType = (
	sourceType: SourceTypesType,
): SourceSpecification["type"] | null => {
	if (sourceType == "tile_raster" || sourceType == "tilejson_raster") {
		return "raster";
	}

	if (
		sourceType == "tilexyz_raster-dem" ||
		sourceType == "tilejson_raster-dem"
	) {
		return "raster-dem";
	}

	if (
		sourceType == "tile_vector" ||
		sourceType == "pmtiles_vector" ||
		sourceType == "tilejson_vector"
	) {
		return "vector";
	}

	if (sourceType == "geojson_url" || sourceType == "geojson_json") {
		return "geojson";
	}

	if (sourceType == "image") {
		return "image";
	}

	if (sourceType == "video") {
		return "video";
	}

	return null;
};

export const getSourceTypeDisplayName = (sourceType: SourceTypesType) => {
	if (sourceType == "tile_raster") {
		return "Raster (Tile URLs)";
	}
	if (sourceType == "tilejson_raster") {
		return "Raster (TileJSON URL)";
	}
	if (sourceType == "tilexyz_raster-dem") {
		return "Raster DEM (Tile URLs)";
	}
	if (sourceType == "tilejson_raster-dem") {
		return "Raster DEM (XYZ URLs)";
	}
	if (sourceType == "tile_vector") {
		return "Vector (Tile URLs)";
	}
	if (sourceType == "tilejson_vector") {
		return "Vector (TileJSON URL)";
	}
	if (sourceType == "pmtiles_vector") {
		return "Vector (PMTiles)";
	}
	if (sourceType == "geojson_url") {
		return "GeoJSON (URL)";
	}
	if (sourceType == "geojson_json") {
		return "GeoJSON (JSON)";
	}
	if (sourceType == "image") {
		return "Image";
	}
	if (sourceType == "video") {
		return "Video";
	}

	return "Generic Source";
};
