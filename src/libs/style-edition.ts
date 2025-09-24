import {
  ExtendedStyleSpecification,
  MapViewMode,
  ModalName,
} from "@/store/types";
import hash from "string-hash";
import style from "@/libs/style";
import {
  validateStyleMin,
  ValidationError,
} from "@maplibre/maplibre-gl-style-spec";
import unset from "lodash/unset";
import { merge } from "lodash";

export const setFetchAccessToken = (
  url: string,
  mapStyle: ExtendedStyleSpecification,
) => {
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
};

export const getMapStyleErrors = (mapStyle: ExtendedStyleSpecification) => {
  const errors: ValidationError[] = validateStyleMin(mapStyle) || [];

  // The validate function doesn't give us errors for duplicate error with
  // empty string for layer.id, manually deal with that here.
  const layerErrors: (Error | ValidationError)[] = [];
  if (mapStyle && mapStyle.layers) {
    const foundLayers = new global.Map();
    mapStyle.layers.forEach((layer, index) => {
      if (layer.id === "" && foundLayers.has(layer.id)) {
        const error = new Error(
          `layers[${index}]: duplicate layer id [empty_string], previously used`,
        );
        layerErrors.push(error);
      }
      foundLayers.set(layer.id, true);
    });
  }

  return layerErrors.concat(errors).map((error) => {
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
      const key = group && property ? [group, property].join(".") : property;
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
};

export const setStateInUrl = ({
  mapStyle,
  selectedLayerIndex,
  mapViewMode,
  modalOpenName,
}: {
  mapStyle: ExtendedStyleSpecification;
  selectedLayerIndex: number;
  mapViewMode: MapViewMode;
  modalOpenName?: ModalName;
}) => {
  const url = new URL(location.href);
  const hashVal = hash(JSON.stringify(mapStyle));
  url.searchParams.set("layer", `${hashVal}~${selectedLayerIndex}`);

  if (modalOpenName) {
    url.searchParams.set("modal", modalOpenName);
  } else {
    url.searchParams.delete("modal");
  }

  if (mapViewMode === "map") {
    url.searchParams.delete("view");
  } else if (mapViewMode === "inspect") {
    url.searchParams.set("view", "inspect");
  }

  history.replaceState({ selectedLayerIndex }, "Maputnik", url.href);
};

export const getUpdatedRootSpec = (
  spec: any,
  fieldName: string,
  newValues: any,
) => {
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
};

export const mergeAndRemoveNulls = <TObject, TSource>(
  target: TObject,
  patch: TSource,
): TObject => {
  const merged = merge({}, target, patch);
  return removeNullsOnMerge(merged, patch);
};

const removeNullsOnMerge = <TObject, TSource>(
  working: TObject,
  patch: TSource,
  path: Array<string | number> = [],
): TObject => {
  if (patch === null || patch == undefined) {
    unset(working as object, path.join("."));
    return working;
  }

  if (Array.isArray(patch)) {
    for (let i = 0; i < patch.length; i++) {
      working = removeNullsOnMerge(working, patch[i], [...path, i]);
    }
    return working;
  }

  if (typeof patch === "object" && patch !== null && patch !== undefined) {
    for (const [key, value] of Object.entries(
      patch as Record<string, unknown>,
    )) {
      working = removeNullsOnMerge(working, value, [...path, key]);
    }
  }
  return working;
};
