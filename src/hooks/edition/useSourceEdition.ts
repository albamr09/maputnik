import { SourceSpecification } from "maplibre-gl";
import { useCallback } from "react";
import { mergeWithReplacementAndRemoveNulls } from "@/libs/style-edition";
import { useSitumSDK } from "@/providers/SitumSDKProvider";
import {
	ExtendedSourceSpecification,
	SourceTypeMap,
	SourceTypeRelationship,
} from "@/store/types";
import { DeepPartial } from "@/types";
import useStyleEdition from "./useStyleEdition";

const useSourceEdition = () => {
	const { patchMapStyle } = useStyleEdition();
	const { getJWT: getSitumJWT } = useSitumSDK();

	const deleteSource = useCallback(
		(id: string) => {
			patchMapStyle({ sources: { [id]: undefined } });
		},
		[patchMapStyle],
	);

	const updateSource = useCallback(
		({ id, source }: { id: string; source: ExtendedSourceSpecification }) => {
			// Inject situm auth
			if ("situmAccessToken" in source) {
				source["x_accessToken"] = getSitumJWT();
				delete source["situmAccessToken"];
			}
			patchMapStyle({ sources: { [id]: source } });
		},
		[patchMapStyle],
	);

	const createDefaultSource = useCallback(
		({ sourceType, source }: SourceTypeRelationship<false>) => {
			const { protocol } = window.location;

			switch (sourceType) {
				case "pmtiles_vector":
					return {
						type: "vector",
						url: `${protocol}//localhost:3000/file.pmtiles`,
					} as any;
				case "geojson_url":
					return {
						type: "geojson",
						data: `${protocol}//localhost:3000/geojson.json`,
					};
				case "geojson_json":
					return {
						type: "geojson",
						cluster: source?.cluster || false,
						data: {},
					};
				case "tilejson_vector":
					return {
						type: "vector",
						url: source?.url || `${protocol}//localhost:3000/tilejson.json`,
					};
				case "tile_vector":
					return {
						type: "vector",
						tiles: source?.tiles || [
							`${protocol}//localhost:3000/{x}/{y}/{z}.pbf`,
						],
						minzoom: source?.minzoom || 0,
						maxzoom: source?.maxzoom || 14,
						scheme: source?.scheme || "xyz",
					};
				case "tilejson_raster":
					return {
						type: "raster",
						url: source?.url || `${protocol}//localhost:3000/tilejson.json`,
					};
				case "tile_raster":
					return {
						type: "raster",
						tiles: source?.tiles || [
							`${protocol}//localhost:3000/{x}/{y}/{z}.png`,
						],
						minzoom: source?.minzoom || 0,
						maxzoom: source?.maxzoom || 14,
						scheme: source?.scheme || "xyz",
						tileSize: source?.tileSize || 512,
					};
				case "tilejson_raster-dem":
					return {
						type: "raster-dem",
						url: source?.url || `${protocol}//localhost:3000/tilejson.json`,
					} satisfies SourceTypeMap["tilejson_raster-dem"];
				case "tilexyz_raster-dem":
					return {
						type: "raster-dem",
						tiles: source?.tiles || [
							`${protocol}//localhost:3000/{x}/{y}/{z}.png`,
						],
						minzoom: source?.minzoom || 0,
						maxzoom: source?.maxzoom || 14,
						tileSize: source?.tileSize || 512,
					};
				case "image":
					return {
						type: "image",
						url: `${protocol}//localhost:3000/image.png`,
						coordinates: [
							[0, 0],
							[0, 0],
							[0, 0],
							[0, 0],
						],
					};
				case "video":
					return {
						type: "video",
						urls: [`${protocol}//localhost:3000/movie.mp4`],
						coordinates: [
							[0, 0],
							[0, 0],
							[0, 0],
							[0, 0],
						],
					};
			}
		},
		[],
	);

	const putLocalSource = useCallback(
		<T extends SourceSpecification>({
			source,
			diffSource,
		}: {
			source: T;
			diffSource: DeepPartial<T>;
		}) => {
			return mergeWithReplacementAndRemoveNulls(source, diffSource) as T;
		},
		[],
	);

	return {
		deleteSource,
		createDefaultSource,
		putLocalSource,
		updateSource,
	};
};

export default useSourceEdition;
