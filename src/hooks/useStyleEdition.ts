import { useCallback, useEffect } from "react";
import {
  ExtendedStyleSpecification,
  MapViewMode,
  ModalStates,
} from "../store/types";
import style from "../libs/style";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import hash from "string-hash";
import { ValidationError } from "maplibre-gl";
import cloneDeep from "lodash.clonedeep";
import { isEqual, unset } from "lodash";
import {
  selectMapStyle,
  selectStyleSpec,
  setDirtyMapStyle,
  setMapStyle,
  setSpec,
  selectSources,
  setSources,
  selectSelectedLayerIndex,
  setSelectedLayerIndex,
  setSelectedLayerOriginalId,
} from "../store/slices/styleCoreSlice";
import {
  addError,
  clearErrors,
  selectModalsState,
  selectMapViewMode,
  toggleModal,
  setMapViewMode,
} from "../store/slices/uiCoreSlice";
import { PMTiles } from "pmtiles";
import {
  downloadGlyphsMetadata,
  downloadSpriteMetadata,
} from "../libs/metadata";
import tokens from "../config/tokens.json";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import useRevisionStore from "./useRevisionStore";
import useStyleStore from "./useStyleStore";

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
  const sources = useAppSelector(selectSources);
  const selectedLayerIndex = useAppSelector(selectSelectedLayerIndex);
  const mapViewMode = useAppSelector(selectMapViewMode);
  const modalsState = useAppSelector(selectModalsState);

  // Hooks
  const { addRevision } = useRevisionStore();
  const { save } = useStyleStore();

  // Helpers
  const setFetchAccessToken = useCallback(
    (url: string, mapStyle: ExtendedStyleSpecification) => {
      const matchesTilehosting = url.match(/\.tilehosting\.com/);
      const matchesMaptiler = url.match(/\.maptiler\.com/);
      const matchesThunderforest = url.match(/\.thunderforest\.com/);
      if (matchesTilehosting || matchesMaptiler) {
        const accessToken = style.getAccessToken("openmaptiles", mapStyle, {
          allowFallback: true,
        });
        if (accessToken) {
          return url.replace("{key}", accessToken);
        }
      } else if (matchesThunderforest) {
        const accessToken = style.getAccessToken("thunderforest", mapStyle, {
          allowFallback: true,
        });
        if (accessToken) {
          return url.replace("{key}", accessToken);
        }
      } else {
        return url;
      }
    },
    [],
  );

  const saveStyle = useCallback(
    (snapshotStyle: ExtendedStyleSpecification) => {
      save(snapshotStyle);
    },
    [save],
  );

  const updateRootSpec = useCallback(
    (spec: any, fieldName: string, newValues: any) => {
      return {
        ...spec,
        $root: {
          ...spec?.$root,
          [fieldName]: {
            ...spec?.$root[fieldName],
            values: newValues,
          },
        },
      };
    },
    [],
  );

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
        dispatch(setSpec(updateRootSpec(styleSpec, "glyphs", fonts)));
      });
    },
    [mapStyle.metadata, styleSpec],
  );

  const updateIcons = useCallback(
    (baseUrl: string) => {
      downloadSpriteMetadata(baseUrl, (icons) => {
        dispatch(setSpec(updateRootSpec(styleSpec, "sprite", icons)));
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
            dispatch(toggleModal(modalName as keyof ModalStates));
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

  const setStateInUrl = useCallback(() => {
    const url = new URL(location.href);
    const hashVal = hash(JSON.stringify(mapStyle));
    url.searchParams.set("layer", `${hashVal}~${selectedLayerIndex}`);

    const openModals = Object.entries(modalsState)
      .map(([key, val]) => (val === true ? key : null))
      .filter((val) => val !== null);

    if (openModals.length > 0) {
      url.searchParams.set("modal", openModals.join(","));
    } else {
      url.searchParams.delete("modal");
    }

    if (mapViewMode === "map") {
      url.searchParams.delete("view");
    } else if (mapViewMode === "inspect") {
      url.searchParams.set("view", "inspect");
    }

    history.replaceState({ selectedLayerIndex }, "Maputnik", url.href);
  }, [mapStyle, selectedLayerIndex, modalsState, mapViewMode]);

  const onStyleChanged = useCallback(
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

      const errors: ValidationError[] = validateStyleMin(mutableStyle) || [];

      // The validate function doesn't give us errors for duplicate error with
      // empty string for layer.id, manually deal with that here.
      const layerErrors: (Error | ValidationError)[] = [];
      if (mutableStyle && mutableStyle.layers) {
        const foundLayers = new global.Map();
        mutableStyle.layers.forEach((layer, index) => {
          if (layer.id === "" && foundLayers.has(layer.id)) {
            const error = new Error(
              `layers[${index}]: duplicate layer id [empty_string], previously used`,
            );
            layerErrors.push(error);
          }
          foundLayers.set(layer.id, true);
        });
      }

      const mappedErrors = layerErrors.concat(errors).map((error) => {
        // Special case: Duplicate layer id
        const dupMatch = error.message.match(
          /layers\[(\d+)\]: (duplicate layer id "?(.*)"?, previously used)/,
        );
        if (dupMatch) {
          const [, index, message] = dupMatch;
          return {
            message: error.message,
            parsed: {
              type: "layer",
              data: {
                index: parseInt(index, 10),
                key: "id",
                message,
              },
            },
          };
        }

        // Special case: Invalid source
        const invalidSourceMatch = error.message.match(
          /layers\[(\d+)\]: (source "(?:.*)" not found)/,
        );
        if (invalidSourceMatch) {
          const [, index, message] = invalidSourceMatch;
          return {
            message: error.message,
            parsed: {
              type: "layer",
              data: {
                index: parseInt(index, 10),
                key: "source",
                message,
              },
            },
          };
        }

        const layerMatch = error.message.match(
          /layers\[(\d+)\]\.(?:(\S+)\.)?(\S+): (.*)/,
        );
        if (layerMatch) {
          const [, index, group, property, message] = layerMatch;
          const key =
            group && property ? [group, property].join(".") : property;
          return {
            message: error.message,
            parsed: {
              type: "layer",
              data: {
                index: parseInt(index, 10),
                key,
                message,
              },
            },
          };
        } else {
          return {
            message: error.message,
          };
        }
      });

      let dirtyMapStyle: ExtendedStyleSpecification | undefined = undefined;
      if (errors.length > 0) {
        dirtyMapStyle = cloneDeep(mutableStyle);

        errors.forEach((error) => {
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
        saveStyle(mutableStyle as ExtendedStyleSpecification);
      }

      dispatch(setMapStyle(mutableStyle));
      if (dirtyMapStyle) {
        dispatch(setDirtyMapStyle(dirtyMapStyle));
      }
      dispatch(clearErrors());
      mappedErrors.forEach((error) => dispatch(addError(error)));

      // Update URL after state update
      setStateInUrl();
    },
    [mapStyle, updateFonts, updateIcons, saveStyle],
  );

  return { onStyleChanged, fetchSources, setStateInUrl };
};

export default useStyleEdition;
