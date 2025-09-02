import {
  LayerSpecification,
  FillExtrusionLayerSpecification,
  ExpressionSpecification,
  FilterSpecification,
} from "maplibre-gl";

// Theme structure types
interface ThemeEntryProperties {
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

interface Theme {
  default?: ThemeEntryProperties;
  [categoryName: string]: ThemeEntryProperties | undefined;
}

// Utility function to get effective value from category or default properties
const getEffectiveValue = <T>(
  catProps: ThemeEntryProperties,
  defProps: ThemeEntryProperties,
  key: keyof ThemeEntryProperties,
  fallback: T,
): T => {
  const val = catProps[key];
  if (val === undefined || val === null) {
    const defVal = defProps[key];
    return defVal !== undefined && defVal !== null ? (defVal as T) : fallback;
  }
  return val as T;
};

// Utility function to create MapLibre condition based on
// feature_type and category
const createFilterForFeatureTypeAndCategory = (themeEntryName: string): FilterSpecification => {
  if (themeEntryName.startsWith(".")) {
    // Only category is present: ".bar"
    const category = themeEntryName.substring(1);
    return ["==", ["get", "category"], category];
  } else if (themeEntryName.includes(".")) {
    // Both feature_type and category are present: "foo.bar"
    const [featureType, category] = themeEntryName.split(".", 2);
    return [
      "all",
      ["==", ["get", "feature_type"], featureType],
      ["==", ["get", "category"], category]
    ];
  } else {
    // Only feature_type is present: "foo"
    return ["==", ["get", "feature_type"], themeEntryName];
  }
};

// Create MapLibre expression for mapping categories to property values
const createCategoryExpression = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  propertyName: keyof ThemeEntryProperties,
  fallback: any,
): ExpressionSpecification => {
  const cases: any[] = [];

  for (const [catName, catProps] of Object.entries(theme)) {
    if (catName === "default" || !catProps) {
      continue;
    }

    let value = getEffectiveValue(
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

    // Convert to float for numeric properties
    if (isNumberValue) {
      value = parseFloat(value as string);
    }

    // Parse the category name to determine the condition
    const condition = createFilterForFeatureTypeAndCategory(catName);

    // Add condition and value for this category
    cases.push(condition, value);
  }

  // Add default value at the end
  const defaultValue = defaultProps[propertyName] ?? fallback;
  cases.push(defaultValue);

  return ["case", ...cases] as ExpressionSpecification;
};

// Get categories that have a specific opacity level
const getThemeEntriesForOpacity = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  opacityLevel: number,
): string[] => {
  const themeEntries: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (themeEntryName === "default" || !themeEntryProps) {
      continue;
    }

    const effectiveOpacity = getEffectiveValue(
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
      themeEntries.push(themeEntryName);
    }
  }

  return themeEntries;
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
    ["has", "fillOpacity"],
    ["==", ["round", ["*", ["get", "fillOpacity"], 10]], opacityLevel * 10],
  ]);

  // Condition 2: Feature doesn't have fillOpacity but its category has this opacity
  if (themeEntryNamesForOpacity.length > 0) {
    const themeBasedConditions = themeEntryNamesForOpacity.reduce((acc, themeEntryName) => {
      acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
      return acc;
    }, [] as FilterSpecification[]);

    conditions.push([
      "all",
      ["!", ["has", "fillOpacity"]],
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
    if (themeEntryName === "default" || !themeEntryProps) {
      continue;
    }

    const effectiveExtrusion = getEffectiveValue(
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
  const themeEntriesWithExtrusion: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (themeEntryName === "default" || !themeEntryProps) {
      continue;
    }

    const effectiveExtrusion = getEffectiveValue(
      themeEntryProps,
      defaultProps,
      "extrusionHeight",
      0,
    );

    if (
      effectiveExtrusion == null || effectiveExtrusion === undefined ||
      parseFloat(effectiveExtrusion as any) == 0
    ) {
      // Store the full theme entry name for proper filtering
      themeEntriesWithExtrusion.push(themeEntryName);
    }
  }

  return themeEntriesWithExtrusion;
};

// Get theme entries that do not have extrusion defined
const getThemeEntriesThatShouldBeShown = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): string[] => {
  const themeEntriesThatShouldBeShown: string[] = [];

  for (const [themeEntryName, themeEntryProps] of Object.entries(theme)) {
    if (themeEntryName === "default" || !themeEntryProps) {
      continue;
    }

    const effectiveExtrusion = getEffectiveValue(
      themeEntryProps,
      defaultProps,
      "show",
      true,
    );

    if (
      effectiveExtrusion == null || effectiveExtrusion === undefined ||
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
  const themeEntriesWithExtrusion = getThemeEntriesWithExtrusion(theme, defaultProps);

  const conditions = [];

  // Condition 1: Feature has extrusionHeight > 0 defined
  conditions.push([
    "all",
    ["has", "extrusionHeight"],
    [">", ["to-number", ["get", "extrusionHeight"]], 0],
  ]);

  // Condition 2: Feature doesn't have extrusionHeight but its theme entry has extrusion defined
  if (themeEntriesWithExtrusion.length > 0) {
    const themeBasedConditions = themeEntriesWithExtrusion.reduce((acc, themeEntryName) => {
      acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
      return acc;
    }, [] as FilterSpecification[]);

    conditions.push([
      "all",
      ["!", ["has", "extrusionHeight"]],
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
  selectedFloorId = 0,
): FillExtrusionLayerSpecification => {
  // Get categories that have this opacity
  const themeEntryNamesForOpacity = getThemeEntriesForOpacity(
    theme,
    defaultProps,
    opacityLevel,
  );

  // Create opacity filter
  const opacityFilter = createOpacityFilter(opacityLevel, themeEntryNamesForOpacity);

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
    ["==", ["get", "floor_id"], selectedFloorId],
  ] as FilterSpecification;

  // Paint properties for extrusion
  const paint = {
    "fill-extrusion-color": [
      "case",
      ["has", "fillColor"],
      ["get", "fillColor"],
      createCategoryExpression(theme, defaultProps, "fillColor", "#000000"),
    ] as ExpressionSpecification,
    "fill-extrusion-height": [
      "case",
      ["has", "extrusionHeight"],
      ["to-number", ["get", "extrusionHeight"]],
      createCategoryExpression(theme, defaultProps, "extrusionHeight", 0),
    ] as ExpressionSpecification,
    "fill-extrusion-opacity": opacityLevel,
  };

  // Create layer ID with opacity
  const opacityStr = opacityLevel.toFixed(1).replace(".", "_");
  const layerId = `situm-geojson-extrude-opacity-${opacityStr}`;

  return {
    id: layerId,
    type: "fill-extrusion",
    source: "geojson",
    "source-layer": "geojson",
    filter: layerFilter,
    paint,
  };
};

const createFlatOrStrokeLayerFilter = (
  theme: Theme,
  defaultProps: ThemeEntryProperties,
): FilterSpecification => {

  // Get theme entries that do not have extrusion defined or are zero
  const themeEntriesWithoutExtrusion = getThemeEntriesWithoutExtrusion(theme, defaultProps);

  const conditions = [];

  // Condition 1: Feature has extrusion height defined and is zero
  conditions.push(["all", 
    ["has", "extrusionHeight"],
    ["==", ["get", "extrusionHeight"], 0]
  ]);

  // Condition 2: Feature doesn't have extrusion defined and extrusion is also not defined or zero on the theme
  if (themeEntriesWithoutExtrusion.length > 0) {
    const themeBasedConditions = themeEntriesWithoutExtrusion.reduce((acc, themeEntryName) => {
      acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
      return acc;
    }, [] as FilterSpecification[]);

    conditions.push([
      "all",
      ["!", ["has", "extrusionHeight"]],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
}

const createShowFilter = (theme: Theme, defaultProps: ThemeEntryProperties): FilterSpecification => {
  const conditions = [];

  // Get theme entries that do not have extrusion defined or are zero
  const themeEntriesThatShouldBeShown = getThemeEntriesThatShouldBeShown(theme, defaultProps);

   // Condition 1: Feature has show defined and is true
  conditions.push(["all", 
    ["has", "show"], 
    ["==", ["to-boolean", ["get", "show"]], true]
  ]);

  // Condition 2: Feature doesn't have show defined and is true or is not defined on the theme
  if (themeEntriesThatShouldBeShown.length > 0) {
    const themeBasedConditions = themeEntriesThatShouldBeShown.reduce((acc, themeEntryName) => {
      acc.push(createFilterForFeatureTypeAndCategory(themeEntryName));
      return acc;
    }, [] as FilterSpecification[]);

    conditions.push([
      "all",
      ["!", ["has", "show"]],
      ["any", ...themeBasedConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
}

// Create standard layer (flat, stroke, line)
const createLayer = (
  layerType: "flat" | "stroke" | "line",
  theme: Theme,
  defaultProps: ThemeEntryProperties,
  selectedFloorId = 0,
): LayerSpecification => {
  let layerFilter: FilterSpecification;

  const showFilter = createShowFilter(theme, defaultProps);

  // Base filter according to layer type
  if (layerType === "flat" || layerType === "stroke") {
    // For flat/stroke: polygons without extrusion or with extrusion = 0
    // Here also check for categories that have the extrusion height defined
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "Polygon"],
      showFilter,
      createFlatOrStrokeLayerFilter(theme, defaultProps),
      // Initialize floor id selection
      ["==", ["get", "floor_id"], selectedFloorId],
    ] as FilterSpecification;
  } else if (layerType === "line") {
    // For line: LineString geometries
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "LineString"],
      showFilter,
      // Initialize floor id selection
      ["==", ["get", "floor_id"], selectedFloorId],
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
        ["has", "fillColor"],
        ["get", "fillColor"],
        createCategoryExpression(theme, defaultProps, "fillColor", "#000000"),
      ] as ExpressionSpecification,
      "fill-opacity": [
        "case",
        ["has", "fillOpacity"],
        ["to-number", ["get", "fillOpacity"]],
        createCategoryExpression(theme, defaultProps, "fillOpacity", 1),
      ] as ExpressionSpecification,
    };
  } else if (layerType === "stroke") {
    paint = {
      "line-color": [
        "case",
        ["has", "strokeColor"],
        ["get", "strokeColor"],
        createCategoryExpression(theme, defaultProps, "strokeColor", "#000000"),
      ] as ExpressionSpecification,
      "line-width": [
        "case",
        ["has", "strokeWidth"],
        ["to-number", ["get", "strokeWidth"]],
        createCategoryExpression(theme, defaultProps, "strokeWidth", 1),
      ] as ExpressionSpecification,
      "line-opacity": [
        "case",
        ["has", "fillOpacity"],
        ["to-number", ["get", "fillOpacity"]],
        createCategoryExpression(theme, defaultProps, "fillOpacity", 1),
      ] as ExpressionSpecification,
    };
  } else if (layerType === "line") {
    paint = {
      "line-color": [
        "case",
        ["has", "strokeColor"],
        ["get", "strokeColor"],
        createCategoryExpression(theme, defaultProps, "strokeColor", "#000000"),
      ] as ExpressionSpecification,
      "line-width": [
        "case",
        ["has", "strokeWidth"],
        ["to-number", ["get", "strokeWidth"]],
        createCategoryExpression(theme, defaultProps, "strokeWidth", 1),
      ] as ExpressionSpecification,
      "line-opacity": [
        "case",
        ["has", "strokeOpacity"],
        ["to-number", ["get", "strokeOpacity"]],
        createCategoryExpression(theme, defaultProps, "strokeOpacity", 1),
      ] as ExpressionSpecification,
    };
  }

  const layerTypeMap = {
    flat: "fill" as const,
    stroke: "line" as const,
    line: "line" as const,
  };

  return {
    id: `situm-geojson-${layerType}`,
    type: layerTypeMap[layerType],
    source: "geojson",
    "source-layer": "geojson",
    filter: layerFilter,
    paint,
  } as LayerSpecification;
};

// Main function to generate all layers
export function generateMapLibreLayers(
  themeJson: Theme,
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
      selectedFloorId,
    );
    layers.push(layer);
  }

  return layers;
}
