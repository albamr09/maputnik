import { isEqual, unset } from "lodash";
import cloneDeep from "lodash.clonedeep";
import { PMTiles } from "pmtiles";
import { useCallback, useEffect } from "react";
import hash from "string-hash";
import tokens from "@/config/tokens.json";
import useRevisionStore from "@/hooks/useRevisionStore";
import useStyleStore from "@/hooks/useStyleStore";
import {
	downloadGlyphsMetadata,
	downloadSpriteMetadata,
} from "@/libs/metadata";
import {
	getMapStyleErrors,
	getUpdatedRootSpec,
	mergeAndRemoveNulls,
	setFetchAccessToken,
	setStateInUrl,
} from "@/libs/style-edition";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	setMapStyle as _setMapStyle,
	selectMapStyle,
	selectSelectedLayerIndex,
	selectStyleSources,
	selectStyleSpec,
	setDirtyMapStyle,
	setSelectedLayerIndex,
	setSelectedLayerOriginalId,
	setSources,
	setSpec,
} from "@/store/slices/styleSlice";
import {
	selectMapViewMode,
	selectModalOpenName,
	setMapViewMode,
	toggleModal,
} from "@/store/slices/uiSlice";
import {
	ExtendedStyleSpecification,
	MapViewMode,
	ModalName,
} from "@/store/types";
import { DeepPartial } from "@/types";

type OnStyleChangedOpts = {
	save?: boolean;
	addRevision?: boolean;
	initialLoad?: boolean;
};

const useStyleEdition = () => {
	// Redux
	const dispatch = useAppDispatch();
	const mapStyle = useAppSelector(selectMapStyle);
	const styleSpec = useAppSelector(selectStyleSpec);
	const sources = useAppSelector(selectStyleSources);
	const selectedLayerIndex = useAppSelector(selectSelectedLayerIndex);
	const mapViewMode = useAppSelector(selectMapViewMode);
	const modalOpenName = useAppSelector(selectModalOpenName);

	// Hooks
	const { addRevision } = useRevisionStore();
	const { save } = useStyleStore();

	// Helpers
	const updateFonts = useCallback(
		(urlTemplate: string) => {
			const metadata: { [key: string]: string } =
				mapStyle.metadata || ({} as any);
			const accessToken =
				metadata["maputnik:openmaptiles_access_token"] || tokens.openmaptiles;

			const glyphUrl =
				typeof urlTemplate === "string"
					? urlTemplate.replace("{key}", accessToken)
					: urlTemplate;
			downloadGlyphsMetadata(glyphUrl, (fonts) => {
				dispatch(setSpec(getUpdatedRootSpec(styleSpec, "glyphs", fonts)));
			});
		},
		[mapStyle.metadata, styleSpec],
	);

	const updateIcons = useCallback(
		(baseUrl: string) => {
			downloadSpriteMetadata(baseUrl, (icons) => {
				dispatch(setSpec(getUpdatedRootSpec(styleSpec, "sprite", icons)));
			});
		},
		[styleSpec],
	);

	const getInitialStateFromUrl = useCallback(
		(mapStyle: ExtendedStyleSpecification) => {
			const url = new URL(location.href);
			const modalParam = url.searchParams.get("modal");

			if (modalParam && modalParam !== "") {
				const modals = modalParam.split(",");
				const modalObj: { [key: string]: boolean } = {};
				modals.forEach((modalName) => {
					modalObj[modalName] = true;
				});

				// Update modal states
				Object.entries(modalObj).forEach(([modalName, isOpen]) => {
					if (isOpen) {
						dispatch(toggleModal(modalName as ModalName));
					}
				});
			}

			const view = url.searchParams.get("view");
			if (view && view !== "") {
				dispatch(setMapViewMode(view as MapViewMode));
			}

			const path = url.searchParams.get("layer");
			if (path) {
				try {
					const parts = path.split("~");
					const [hashVal, selectedLayerIndex] = [
						parts[0],
						parseInt(parts[1], 10),
					];

					let valid = true;
					if (hashVal !== "-") {
						const currentHashVal = hash(JSON.stringify(mapStyle));
						if (currentHashVal !== parseInt(hashVal, 10)) {
							valid = false;
						}
					}
					if (valid) {
						dispatch(setSelectedLayerIndex(selectedLayerIndex));
						if (mapStyle.layers[selectedLayerIndex]) {
							dispatch(
								setSelectedLayerOriginalId(
									mapStyle.layers[selectedLayerIndex].id,
								),
							);
						}
					}
				} catch (err) {
					console.warn(err);
				}
			}
		},
		[dispatch, mapStyle],
	);

	const fetchSources = useCallback(() => {
		const sourceList: { [key: string]: any } = {};

		for (const [key, val] of Object.entries(mapStyle.sources)) {
			if (
				!Object.prototype.hasOwnProperty.call(sources, key) &&
				val.type === "vector" &&
				Object.prototype.hasOwnProperty.call(val, "url")
			) {
				sourceList[key] = {
					type: val.type,
					layers: [],
				};

				let url = val.url;

				try {
					url = setFetchAccessToken(url!, mapStyle);
				} catch (err) {
					console.warn("Failed to setFetchAccessToken: ", err);
				}

				const setVectorLayers = (json: any) => {
					if (!Object.prototype.hasOwnProperty.call(json, "vector_layers")) {
						return;
					}

					// Create new objects before setState
					const newSources = Object.assign(
						{},
						{
							[key]: sources[key],
						},
					);

					for (const layer of json.vector_layers) {
						(newSources[key] as any).layers.push(layer.id);
					}

					dispatch(setSources(newSources));
				};

				if (url!.startsWith("pmtiles://")) {
					new PMTiles(url!.substr(10))
						.getTileJson("")
						.then((json) => setVectorLayers(json))
						.catch((err) => {
							console.error("Failed to process sources for '%s'", url, err);
						});
				} else {
					fetch(url!, {
						mode: "cors",
					})
						.then((response) => response.json())
						.then((json) => setVectorLayers(json))
						.catch((err) => {
							console.error("Failed to process sources for '%s'", url, err);
						});
				}
			} else {
				sourceList[key] = sources[key] || mapStyle.sources[key];
			}
		}

		if (!isEqual(sources, sourceList)) {
			console.debug("Setting sources");
			dispatch(setSources(sourceList));
		}
	}, [mapStyle.sources, sources]);

	// Watch for changes in mapStyle.sources and fetch sources when they change
	useEffect(() => {
		if (mapStyle.sources && Object.keys(mapStyle.sources).length > 0) {
			fetchSources();
		}
	}, [mapStyle.sources, fetchSources]);

	const setMapStyle = useCallback(
		(newStyle: ExtendedStyleSpecification, opts: OnStyleChangedOpts = {}) => {
			opts = {
				save: true,
				addRevision: true,
				initialLoad: false,
				...opts,
			};
			const mutableStyle = structuredClone(newStyle);

			// For the style object, find the urls that has "{key}" and insert the correct API keys
			// Without this, going from e.g. MapTiler to OpenLayers and back will lose the maptlier key.
			if (mutableStyle.glyphs && typeof mutableStyle.glyphs === "string") {
				mutableStyle.glyphs = setFetchAccessToken(
					mutableStyle.glyphs,
					mutableStyle,
				);
			}

			if (mutableStyle.sprite && typeof mutableStyle.sprite === "string") {
				mutableStyle.sprite = setFetchAccessToken(
					mutableStyle.sprite,
					mutableStyle,
				);
			}

			for (const [_sourceId, source] of Object.entries(mutableStyle.sources)) {
				if (source && "url" in source && typeof source.url === "string") {
					source.url = setFetchAccessToken(source.url, mutableStyle);
				}
			}

			if (opts.initialLoad) {
				getInitialStateFromUrl(mutableStyle);
			}

			const mapStyleErrors = getMapStyleErrors(mutableStyle);

			let dirtyMapStyle: ExtendedStyleSpecification | undefined = undefined;
			if (mapStyleErrors.length > 0) {
				dirtyMapStyle = cloneDeep(mutableStyle);

				mapStyleErrors.forEach((error) => {
					const { message } = error;
					if (message) {
						try {
							const objPath = message.split(":")[0];
							// Errors can be deply nested for example 'layers[0].filter[1][1][0]' we only care upto the property 'layers[0].filter'
							const unsetPath = objPath.match(/^\S+?\[\d+\]\.[^[]+/)![0];
							unset(dirtyMapStyle, unsetPath);
						} catch (err) {
							console.warn(err);
						}
					}
				});
			}

			if (mutableStyle.glyphs !== mapStyle.glyphs) {
				updateFonts(mutableStyle.glyphs as string);
			}
			if (mutableStyle.sprite !== mapStyle.sprite) {
				updateIcons(mutableStyle.sprite as string);
			}

			if (opts.addRevision) {
				addRevision(mutableStyle);
			}
			if (opts.save) {
				save(mutableStyle as ExtendedStyleSpecification);
			}

			dispatch(_setMapStyle(mutableStyle));
			if (dirtyMapStyle) {
				dispatch(setDirtyMapStyle(dirtyMapStyle));
			}

			// Update URL after state update
			setStateInUrl({
				mapStyle: mutableStyle,
				selectedLayerIndex,
				mapViewMode,
				modalOpenName,
			});
		},
		[mapStyle, updateFonts, updateIcons],
	);

	/**
	 * Allows for partial updates on the style
	 */
	const patchMapStyle = useCallback(
		(partialStylePatch: DeepPartial<ExtendedStyleSpecification>) => {
			const mergedStyle = mergeAndRemoveNulls(mapStyle, partialStylePatch);
			setMapStyle(mergedStyle);
		},
		[mapStyle, setMapStyle],
	);

	return { setMapStyle, patchMapStyle, fetchSources };
};

export default useStyleEdition;
