import { derefLayers } from "@maplibre/maplibre-gl-style-spec";
import type {
  StyleSpecification,
  LayerSpecification,
  ExpressionSpecification,
} from "maplibre-gl";
import tokens from "../config/tokens.json";
import { hasFloorFilter, removeFloorFilter } from "./floor-filter";

// Empty style is always used if no style could be restored or fetched
const emptyStyle = ensureStyleValidity({
  version: 8,
  sources: {},
  layers: [],
});

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function ensureHasId(
  style: StyleSpecification & { id?: string },
): StyleSpecification & { id: string } {
  if (!("id" in style) || !style.id) {
    style.id = generateId();
    return style as StyleSpecification & { id: string };
  }
  return style as StyleSpecification & { id: string };
}

function ensureHasNoInteractive(style: StyleSpecification & { id: string }) {
  const changedLayers = style.layers.map((layer) => {
    const changedLayer: LayerSpecification & { interactive?: any } = {
      ...layer,
    };
    delete changedLayer.interactive;
    return changedLayer;
  });

  return {
    ...style,
    layers: changedLayers,
  };
}

function ensureHasNoRefs(style: StyleSpecification & { id: string }) {
  return {
    ...style,
    layers: derefLayers(style.layers),
  };
}

function ensureStyleValidity(
  style: StyleSpecification,
): StyleSpecification & { id: string } {
  return ensureHasNoInteractive(ensureHasNoRefs(ensureHasId(style)));
}

function indexOfLayer(layers: LayerSpecification[], layerId: string) {
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].id === layerId) {
      return i;
    }
  }
  return null;
}

function getAccessToken(
  sourceName: string,
  mapStyle: StyleSpecification,
  opts: { allowFallback?: boolean },
) {
  const metadata = mapStyle.metadata || ({} as any);
  let accessToken = metadata[`maputnik:${sourceName}_access_token`];

  if (opts.allowFallback && !accessToken) {
    accessToken = tokens[sourceName as keyof typeof tokens];
  }

  return accessToken;
}

function replaceSourceAccessToken(
  mapStyle: StyleSpecification,
  sourceName: string,
  opts = {},
) {
  const source = mapStyle.sources[sourceName];
  if (!source) return mapStyle;
  if (!("url" in source) || !source.url) return mapStyle;

  // Check for x_accessToken on the source
  const accessToken = (source as any).x_accessToken;
  let sourceUrl: string = source.url;
  if (accessToken) {
    // Append as query param (handle ? or &)
    const sep = sourceUrl.includes("?") ? "&" : "?";
    sourceUrl = `${sourceUrl}${sep}access_token=${encodeURIComponent(accessToken)}`;
  } else {
    // Fallback to old logic
    let authSourceName = sourceName;
    if (
      sourceName === "thunderforest_transport" ||
      sourceName === "thunderforest_outdoors"
    ) {
      authSourceName = "thunderforest";
    } else if ("url" in source && source.url?.match(/\.stadiamaps\.com/)) {
      // The code currently usually assumes openmaptiles == MapTiler,
      // so we need to check the source URL.
      authSourceName = "stadia";
    }

    const fallbackToken = getAccessToken(authSourceName, mapStyle, opts);

    if (!fallbackToken) {
      // Early exit.
      return mapStyle;
    }

    if (authSourceName == "stadia") {
      // Stadia Maps does not always require an API key,
      // so there is no placeholder in our styles.
      // We append it at the end of the URL when exporting if necessary.
      sourceUrl = `${source.url}?api_key=${fallbackToken}`;
    } else {
      sourceUrl = source.url.replace("{key}", fallbackToken);
    }
  }

  const changedSources = {
    ...mapStyle.sources,
    [sourceName]: {
      ...source,
      url: sourceUrl,
    },
  };
  const changedStyle = {
    ...mapStyle,
    sources: changedSources,
  };
  return changedStyle;
}

function replaceAccessTokens(mapStyle: StyleSpecification, opts = {}) {
  let changedStyle = mapStyle;

  Object.keys(mapStyle.sources).forEach((sourceName) => {
    changedStyle = replaceSourceAccessToken(changedStyle, sourceName, opts);
  });

  if (
    mapStyle.glyphs &&
    (mapStyle.glyphs.match(/\.tilehosting\.com/) ||
      mapStyle.glyphs.match(/\.maptiler\.com/))
  ) {
    const newAccessToken = getAccessToken("openmaptiles", mapStyle, opts);
    if (newAccessToken) {
      changedStyle = {
        ...changedStyle,
        glyphs: mapStyle.glyphs.replace("{key}", newAccessToken),
      };
    }
  }

  return changedStyle;
}

function stripSitumMetadata(mapStyle: StyleSpecification) {
  const changedMetadata = {
    ...(mapStyle.metadata as any),
  };
  delete changedMetadata["maputnik:situm-apikey"];
  delete changedMetadata["maputnik:situm-building-id"];

  return {
    ...mapStyle,
    metadata: changedMetadata,
  };
}

function stripFloorFilter(mapStyle: StyleSpecification) {
  const styleLayers = [...mapStyle.layers];

  const changedLayers = styleLayers.map((layer) => {
    if (!("filter" in layer)) return layer;
    const layerFilter = layer.filter as ExpressionSpecification;
    if (!layerFilter || !hasFloorFilter(layerFilter)) return layer;

    const changedLayerFilter = removeFloorFilter(layerFilter);
    return {
      ...layer,
      filter: changedLayerFilter,
    };
  });

  return {
    ...mapStyle,
    layers: changedLayers,
  };
}

function stripAccessTokens(mapStyle: StyleSpecification) {
  const changedMetadata = {
    ...(mapStyle.metadata as any),
  };
  delete changedMetadata["maputnik:openmaptiles_access_token"];
  delete changedMetadata["maputnik:thunderforest_access_token"];
  delete changedMetadata["maputnik:stadia_access_token"];

  // Remove x_accessToken and access_token/api_key query params from each source
  const changedSources = Object.fromEntries(
    Object.entries(mapStyle.sources || {}).map(([sourceName, source]) => {
      if (source && typeof source === "object") {
        // Remove x_accessToken
        const { x_accessToken, ...rest } = source as any;
        // Remove access_token and api_key from url if present
        let newUrl = rest.url;
        if (typeof newUrl === "string") {
          try {
            const urlObj = new URL(newUrl, "http://dummy"); // base for relative URLs
            urlObj.searchParams.delete("access_token");
            urlObj.searchParams.delete("api_key");
            // Remove trailing ? if no params left
            newUrl = urlObj.pathname + (urlObj.search ? urlObj.search : "");
            // If original url had protocol, keep it
            if (/^https?:\/\//.test(rest.url)) {
              newUrl = urlObj.origin + newUrl;
            }
          } catch (e) {
            // If URL parsing fails, leave as is
          }
        }
        return [sourceName, { ...rest, url: newUrl }];
      }
      return [sourceName, source];
    }),
  );

  return {
    ...mapStyle,
    metadata: changedMetadata,
    sources: changedSources,
  };
}

export default {
  ensureStyleValidity,
  emptyStyle,
  indexOfLayer,
  generateId,
  getAccessToken,
  replaceAccessTokens,
  stripAccessTokens,
  stripFloorFilter,
  stripSitumMetadata,
};
