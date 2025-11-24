import {
  LayerSpecification,
  FillExtrusionLayerSpecification,
  ExpressionSpecification,
  FilterSpecification,
} from "maplibre-gl";

// Theme structure types
interface ThemeEntryProperties {
  feature_type?: string;
  category?: string;
  fillColor?: string;
  strokeColor?: string;
  fillOpacity?: number;
  strokeOpacity?: number;
  extrusionHeight?: number;
  strokeWidth?: number;
  show?: boolean;
  // TODO ALBA: handle this
  poiId?: string;
}

export const DEFAULT_GEOJSON_SOURCE_ID = "geojson";

interface Theme {
  default?: ThemeEntryProperties;
  [categoryName: string]: ThemeEntryProperties | undefined;
}

// Utility function to get effective value from category or default properties
const getThemeEffectiveValue = <K extends keyof ThemeEntryProperties>(
  catProps: ThemeEntryProperties,
  defProps: ThemeEntryProperties,
  key: K,
  fallback: ThemeEntryProperties[K]
): ThemeEntryProperties[K] => {
  const val = catProps[key];
  const defVal = defProps[key];

  // Pick the first defined value
  const rawValue = val ?? defVal ?? fallback;

  if (typeof fallback === 'number') return Number(rawValue) as ThemeEntryProperties[K];
  if (typeof fallback === 'boolean') return Boolean(rawValue) as ThemeEntryProperties[K];
  if (typeof fallback === 'string') return String(rawValue) as ThemeEntryProperties[K];

  return rawValue as ThemeEntryProperties[K];
};

const getDefaultSafeValue = <K extends keyof ThemeEntryProperties>(
  defProps: ThemeEntryProperties,
  key: keyof ThemeEntryProperties,
  fallback: ThemeEntryProperties[K]
): ThemeEntryProperties[K] => {
  const defVal = defProps[key];

  // Pick the first defined value
  const rawValue = defVal ?? fallback;

  // Cast value based on the fallback
  if (typeof fallback === 'number') return Number(rawValue) as ThemeEntryProperties[K];
  if (typeof fallback === 'boolean') return Boolean(rawValue) as ThemeEntryProperties[K];
  if (typeof fallback === 'string') return String(rawValue) as ThemeEntryProperties[K];

  // Default: return as-is
  return rawValue as ThemeEntryProperties[K];
};

const checkPropertyExists = (
  propertyName: keyof ThemeEntryProperties,
  type: "number" | "string" | "boolean" | "color"
) => {
  // Strings or colors are assumed to not exist if they do not appear under properties, or if its value is empty
  if (type == "string" || type == "color") {
    // Assume type for a color property is string, so we can compare its value with ""
    return ["all", ["has", propertyName], ["!=", getMaplibreProperty(propertyName, "string"), ""]] as ExpressionSpecification;
  }
  
  return ["has", propertyName] as ExpressionSpecification;
}

const getMaplibreProperty = (
  propertyName: keyof ThemeEntryProperties | "floor_id",
  type: "number" | "string" | "boolean" | "color"
): ExpressionSpecification => {
  if (type == "number") {
    return ["to-number", ["get", propertyName]];
  } else if (type == "string") {
    return ["to-string", ["get", propertyName]];
  } else if (type == "boolean") {
    return ["to-boolean", ["get", propertyName]];
  } else if (type == "color") {
    return ["to-color", ["get", propertyName]];
  }

  return ["get", propertyName]
};

// Utility function to create MapLibre condition based on
// feature_type and category
const createFilterForFeatureTypeAndCategory = (
  themeEntryName: string,
): FilterSpecification => {
  // Default means no feature_type or category
  if (themeEntryName == "default") {
    return [
      "all",
      [
        // Does not have feature_type property
        "!",
        checkPropertyExists("feature_type", "string")
      ],
      [
        // Does not have category property
        "!",
        checkPropertyExists("category", "string")
      ],
    ];
  }

  if (themeEntryName.includes(".") && !themeEntryName.startsWith(".")) {
    // Both feature_type and category are present: "foo.bar"
    const [featureType, category] = themeEntryName.split(".", 2);
    return [
      "all",
      ["==", getMaplibreProperty("feature_type", "string"), featureType],
      ["==", getMaplibreProperty("category", "string"), category],
    ];
  }

  if (themeEntryName.startsWith(".")) {
    // Only category is present
    const category = themeEntryName.substring(1);
    return [
      "all",
      [
        // Does not have feature_type property
        "!",
        checkPropertyExists("feature_type", "string")
      ],
      ["==", getMaplibreProperty("category", "string"), category],
    ];
  }

  // Only feature_type is present
  return [
    "all",
    [
      // Does not have category property
      "!",
      checkPropertyExists("category", "string")
    ],
    ["==", getMaplibreProperty("feature_type", "string"), themeEntryName],
  ];
};

// Create MapLibre expression for mapping categories to property values
const createThemeEntryExpression = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  propertyName: keyof ThemeEntryProperties,
  fallback: any,
): ExpressionSpecification => {
  // Extract and sort entries by specificity so conditinals are checked correctly
  const sortedEntries = Object.entries(theme)
    .filter(([_, catProps]) => catProps)
    .sort(([a], [b]) => {
      const score = (name: string) => {
        if (name.includes(".") && !name.startsWith(".")) return 0; // feature_type+category
        if (name.startsWith(".")) return 1; // category only
        return 2; // feature_type only
      };
      return score(a) - score(b);
    }) as [string, ThemeEntryProperties][];

  const cases = sortedEntries.reduce((acc, [catName, catProps]) => {
    let value = getThemeEffectiveValue(
      catProps,
      defaultProps,
      propertyName,
      fallback,
    );

    const isNumberValue = [
      "fillOpacity",
      "strokeOpacity",
      "extrusionHeight",
      "strokeWidth",
    ].includes(propertyName);

    if (isNumberValue) {
      value = parseFloat(value as string);
    }

    const condition = createFilterForFeatureTypeAndCategory(catName);
    acc.push(condition, value);
    return acc;
  }, [] as any[]);

  // Add default at the end
  const defaultValue = getDefaultSafeValue(defaultProps, propertyName, fallback);
  cases.push(defaultValue);

  return ["case", ...cases] as ExpressionSpecification;
};

// Get categories that have a specific opacity level
const getThemeEntriesForOpacity = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  opacityLevel: number,
): string[] => {
  return Object.entries(theme).reduce(
    (acc, [themeEntryName, themeEntryProps]) => {
      if (!themeEntryProps) {
        return acc;
      }

      const effectiveOpacity = getThemeEffectiveValue(
        themeEntryProps,
        defaultProps,
        "fillOpacity",
        1.0,
      );

      // Round to 1 decimal place
      const roundedOpacity =
        Math.round(parseFloat(effectiveOpacity as any) * 10) / 10;

      if (roundedOpacity === opacityLevel) {
        // Store the full category name for proper filtering
        acc.push(themeEntryName);
      }

      return acc;
    },
    [] as string[],
  );
};

// Create opacity filter for features
const createOpacityFilter = (
  opacityLevel: number,
  themeEntryNamesForOpacity: string[],
): FilterSpecification => {
  const conditions: any[] = [];

  // Condition 1: Feature has fillOpacity and matches the level
  conditions.push([
    "all",
    checkPropertyExists("fillOpacity", "number"),
    ["==", ["round", ["*", getMaplibreProperty("fillOpacity", "number"), 10]], opacityLevel * 10],
  ]);

  // Condition 2: Feature doesn't have fillOpacity but its category has this opacity
  if (themeEntryNamesForOpacity.length > 0) {
    const themeBasedConditions = themeEntryNamesForOpacity.reduce(
      (acc, themeEntryName) => {
        acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
        return acc;
      },
      [] as FilterSpecification[],
    );

    conditions.push([
      "all",
      ["!", checkPropertyExists("fillOpacity", "number")],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
};

// Get theme entries that have extrusion defined
const getThemeEntriesWithExtrusion = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): string[] => {
  const themeEntriesWithExtrusion: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (!themeEntryProps) {
      continue;
    }

    const effectiveExtrusion = getThemeEffectiveValue(
      themeEntryProps,
      defaultProps,
      "extrusionHeight",
      0,
    );

    if (
      effectiveExtrusion !== null &&
      parseFloat(effectiveExtrusion as any) > 0
    ) {
      // Store the full theme entry name for proper filtering
      themeEntriesWithExtrusion.push(themeEntryName);
    }
  }

  return themeEntriesWithExtrusion;
};

// Get theme entries that do not have extrusion defined
const getThemeEntriesWithoutExtrusion = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): string[] => {
  const themeEntriesWithoutExtrusion: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (!themeEntryProps) {
      continue;
    }

    const effectiveExtrusion = getThemeEffectiveValue(
      themeEntryProps,
      defaultProps,
      "extrusionHeight",
      0,
    );

    if (
      effectiveExtrusion == null ||
      effectiveExtrusion === undefined ||
      parseFloat(effectiveExtrusion as any) == 0
    ) {
      // Store the full theme entry name for proper filtering
      themeEntriesWithoutExtrusion.push(themeEntryName);
    }
  }

  return themeEntriesWithoutExtrusion;
};

// Get theme entries that have stroke width defined
const getThemeEntriesWithStrokeWidth = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): string[] => {
  const themeEntriesWithStrokeWidth: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (!themeEntryProps) {
      continue;
    }

    const effectiveStrokeWidth = getThemeEffectiveValue(
      themeEntryProps,
      defaultProps,
      "strokeWidth",
      0,
    );

    if (
      effectiveStrokeWidth != null &&
      effectiveStrokeWidth !== undefined &&
      parseFloat(effectiveStrokeWidth as any) > 0
    ) {
      // Store the full theme entry name for proper filtering
      themeEntriesWithStrokeWidth.push(themeEntryName);
    }
  }

  return themeEntriesWithStrokeWidth;
};

// Get theme entries that do not have extrusion defined
const getThemeEntriesThatShouldBeShown = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): string[] => {
  const themeEntriesThatShouldBeShown: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (!themeEntryProps) {
      continue;
    }

    const effectiveExtrusion = getThemeEffectiveValue(
      themeEntryProps,
      defaultProps,
      "show",
      true,
    );

    if (
      effectiveExtrusion == null ||
      effectiveExtrusion === undefined ||
      effectiveExtrusion == true
    ) {
      // Store the full theme entry name for proper filtering
      themeEntriesThatShouldBeShown.push(themeEntryName);
    }
  }

  return themeEntriesThatShouldBeShown;
};

// Create extrusion filter
const createExtrusionFilter = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): FilterSpecification => {
  // Get theme entries that have extrusion defined
  const themeEntriesWithExtrusion = getThemeEntriesWithExtrusion(
    theme,
    defaultProps,
  );

  const conditions = [];

  // Condition 1: Feature has extrusionHeight > 0 defined
  conditions.push([
    "all",
    checkPropertyExists("extrusionHeight", "number"),
    [">", getMaplibreProperty("extrusionHeight", "number"), 0],
  ]);

  // Condition 2: Feature doesn't have extrusionHeight but its theme entry has extrusion defined
  if (themeEntriesWithExtrusion.length > 0) {
    const themeBasedConditions = themeEntriesWithExtrusion.reduce(
      (acc, themeEntryName) => {
        acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
        return acc;
      },
      [] as FilterSpecification[],
    );

    conditions.push([
      "all",
      ["!", checkPropertyExists("extrusionHeight", "number")],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
};

// Create extrusion layer for specific opacity level
const createExtrusionLayer = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  opacityLevel: number,
  sourceId: string,
  selectedFloorId = 0,
): FillExtrusionLayerSpecification => {
  // Get categories that have this opacity
  const themeEntryNamesForOpacity = getThemeEntriesForOpacity(
    theme,
    defaultProps,
    opacityLevel,
  );

  // Create opacity filter
  const opacityFilter = createOpacityFilter(
    opacityLevel,
    themeEntryNamesForOpacity,
  );

  // Create extrusion filter
  const extrusionFilter = createExtrusionFilter(theme, defaultProps);

  // Create show filter
  const showFilter = createShowFilter(theme, defaultProps);

  // Complete filter for extrusion: must meet geometry, opacity AND extrusion
  const layerFilter = [
    "all",
    ["==", ["geometry-type"], "Polygon"],
    showFilter,
    opacityFilter,
    extrusionFilter,
    // Initialize floor id selection
    ["==", getMaplibreProperty("floor_id", "number"), selectedFloorId],
  ] as FilterSpecification;

  // Paint properties for extrusion
  const paint = {
    "fill-extrusion-color": [
      "case",
      checkPropertyExists("fillColor", "color"),
      getMaplibreProperty("fillColor", "color"),
      createThemeEntryExpression(theme, defaultProps, "fillColor", "#000000"),
    ] as ExpressionSpecification,
    "fill-extrusion-height": [
      "case",
      checkPropertyExists("extrusionHeight", "number"),
      getMaplibreProperty("extrusionHeight", "number"),
      createThemeEntryExpression(theme, defaultProps, "extrusionHeight", 0),
    ] as ExpressionSpecification,
    "fill-extrusion-opacity": opacityLevel,
  };

  // Create layer ID with opacity
  const opacityStr = opacityLevel.toFixed(1).replace(".", "_");
  const layerId = `situm-${sourceId}-extrude-opacity-${opacityStr}`;

  return {
    id: layerId,
    type: "fill-extrusion",
    source: sourceId,
    "source-layer": "geojson",
    filter: layerFilter,
    paint,
  };
};

const createNoExtrusionFilter = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
) => {
  // Get theme entries that do not have extrusion defined or are zero
  const themeEntriesWithoutExtrusion = getThemeEntriesWithoutExtrusion(
    theme,
    defaultProps,
  );

  const conditions = [];

  // Condition 1: Feature has extrusion height defined and is zero
  conditions.push([
    "all",
    checkPropertyExists("extrusionHeight", "number"),
    ["==", getMaplibreProperty("extrusionHeight", "number"), 0],
  ]);

  // Condition 2: Feature doesn't have extrusion defined and extrusion is also not defined or zero on the theme
  if (themeEntriesWithoutExtrusion.length > 0) {
    const themeBasedConditions = themeEntriesWithoutExtrusion.reduce(
      (acc, themeEntryName) => {
        acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
        return acc;
      },
      [] as FilterSpecification[],
    );

    conditions.push([
      "all",
      ["!", checkPropertyExists("extrusionHeight", "number")],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
}

const createStrokeFilter = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): FilterSpecification => {
  // Get theme entries that do not have extrusion defined or are zero
  const themeEntriesWithStrokeWidth = getThemeEntriesWithStrokeWidth(
    theme,
    defaultProps,
  );

  const conditions = [];

  // Condition 1: Feature has stroke width > 0
  conditions.push([
    "all",
    checkPropertyExists("strokeWidth", "number"),
    [">", getMaplibreProperty("strokeWidth", "number"), 0],
  ]);

  // Condition 2: Feature doesn't have stroke width defined and stroke width is defined on the theme
  if (themeEntriesWithStrokeWidth.length > 0) {
    const themeBasedConditions = themeEntriesWithStrokeWidth.reduce(
      (acc, themeEntryName) => {
        acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
        return acc;
      },
      [] as FilterSpecification[],
    );

    conditions.push([
      "all",
      ["!", checkPropertyExists("strokeWidth", "number")],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
};

const createShowFilter = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): FilterSpecification => {
  const conditions = [];

  // Get theme entries that do not have extrusion defined or are zero
  const themeEntriesThatShouldBeShown = getThemeEntriesThatShouldBeShown(
    theme,
    defaultProps,
  );

  // Condition 1: Feature has show defined and is true
  conditions.push([
    "all",
    checkPropertyExists("show", "boolean"),
    ["==", getMaplibreProperty("show", "boolean"), true],
  ]);

  // Condition 2: Feature doesn't have show defined or is not defined on the theme
  if (themeEntriesThatShouldBeShown.length > 0) {
    const themeBasedConditions = themeEntriesThatShouldBeShown.reduce(
      (acc, themeEntryName) => {
        acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
        return acc;
      },
      [] as FilterSpecification[],
    );

    conditions.push([
      "all",
      ["!", checkPropertyExists("show", "boolean")],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
};

// Create standard layer (flat, stroke, line)
const createLayer = (
  layerType: "flat" | "stroke" | "line",
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  sourceId: string,
  selectedFloorId = 0,
): LayerSpecification => {
  let layerFilter: FilterSpecification;

  const showFilter = createShowFilter(theme, defaultProps);

  // Base filter according to layer type
  if (layerType === "flat") {
    // For flat/stroke: polygons without extrusion or with extrusion = 0
    // Here also check for categories that have the extrusion height defined
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "Polygon"],
      showFilter,
      createNoExtrusionFilter(theme, defaultProps),
      // Initialize floor id selection
      ["==", getMaplibreProperty("floor_id", "number"), selectedFloorId],
    ] as FilterSpecification;
  }  else if (layerType == "stroke") {
    // For stroke: polygons without extrusion or with extrusion = 0
    // also filter out features which do not have stroke width or stroke width is zero
    // Here also check for categories that have the extrusion height defined
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "Polygon"],
      showFilter,
      createNoExtrusionFilter(theme, defaultProps),
      createStrokeFilter(theme, defaultProps),
      // Initialize floor id selection
      ["==", getMaplibreProperty("floor_id", "number"), selectedFloorId],
    ] as FilterSpecification;
  } else if (layerType === "line") {
    // For line: LineString geometries
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "LineString"],
      showFilter,
      // Initialize floor id selection
      ["==", getMaplibreProperty("floor_id", "number"), selectedFloorId],
    ] as FilterSpecification;
  } else {
    throw new Error(
      `layer_type '${layerType}' not supported in createLayer. Use createExtrusionLayer for extrusion.`,
    );
  }

  // Create paint properties using expressions that handle multiple categories
  let paint: any = {};

  if (layerType === "flat") {
    paint = {
      "fill-color": [
        "case",
        checkPropertyExists("fillColor", "color"),
        getMaplibreProperty("fillColor", "color"),
        createThemeEntryExpression(theme, defaultProps, "fillColor", "#000000"),
      ] as ExpressionSpecification,
      "fill-opacity": [
        "case",
        checkPropertyExists("fillOpacity", "number"),
        getMaplibreProperty("fillOpacity", "number"),
        createThemeEntryExpression(theme, defaultProps, "fillOpacity", 1),
      ] as ExpressionSpecification,
    };
  } else if (layerType === "stroke") {
    paint = {
      "line-color": [
        "case",
        checkPropertyExists("strokeColor", "color"),
        getMaplibreProperty("strokeColor", "color"),
        createThemeEntryExpression(
          theme,
          defaultProps,
          "strokeColor",
          "#000000",
        ),
      ] as ExpressionSpecification,
      "line-width": [
        "case",
        checkPropertyExists("strokeWidth", "number"),
        getMaplibreProperty("strokeWidth", "number"),
        createThemeEntryExpression(theme, defaultProps, "strokeWidth", 1),
      ] as ExpressionSpecification,
      "line-opacity": [
        "case",
        checkPropertyExists("fillOpacity", "number"),
        getMaplibreProperty("fillOpacity", "number"),
        createThemeEntryExpression(theme, defaultProps, "fillOpacity", 1),
      ] as ExpressionSpecification,
    };
  } else if (layerType === "line") {
    paint = {
      "line-color": [
        "case",
        checkPropertyExists("strokeColor", "color"),
        getMaplibreProperty("strokeColor", "color"),
        createThemeEntryExpression(
          theme,
          defaultProps,
          "strokeColor",
          "#000000",
        ),
      ] as ExpressionSpecification,
      "line-width": [
        "case",
        checkPropertyExists("strokeWidth", "number"),
        getMaplibreProperty("strokeWidth", "number"),
        createThemeEntryExpression(theme, defaultProps, "strokeWidth", 1),
      ] as ExpressionSpecification,
      "line-opacity": [
        "case",
        checkPropertyExists("strokeOpacity", "number"),
        getMaplibreProperty("strokeOpacity", "number"),
        createThemeEntryExpression(theme, defaultProps, "strokeOpacity", 1),
      ] as ExpressionSpecification,
    };
  }

  const layerTypeMap = {
    flat: "fill" as const,
    stroke: "line" as const,
    line: "line" as const,
  };

  return {
    id: `situm-${sourceId}-${layerType}`,
    type: layerTypeMap[layerType],
    source: sourceId,
    "source-layer": "geojson",
    filter: layerFilter,
    paint,
  } as LayerSpecification;
};

// Main function to generate all layers
export function generateMapLibreLayers(
  themeJson: Theme,
  sourceId: string,
  selectedFloorId = 0,
): LayerSpecification[] {
  const defaultProps = themeJson.default || {};
  const layers: LayerSpecification[] = [];

  // Generate flat, stroke and line layers (one each)
  const layerTypes: ("flat" | "stroke" | "line")[] = ["flat", "stroke", "line"];
  for (const layerType of layerTypes) {
    const layer = createLayer(
      layerType,
      themeJson,
      defaultProps,
      sourceId,
      selectedFloorId,
    );
    layers.push(layer);
  }

  // Generate multiple extrusion layers by opacity level
  const opacityLevels = Array.from(
    { length: 11 },
    (_, i) => Math.round(i * 0.1 * 10) / 10,
  );

  for (const opacityLevel of opacityLevels) {
    const layer = createExtrusionLayer(
      themeJson,
      defaultProps,
      opacityLevel,
      sourceId,
      selectedFloorId,
    );
    layers.push(layer);
  }

  return layers;
}
