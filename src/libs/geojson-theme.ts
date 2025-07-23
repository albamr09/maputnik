import {
  LayerSpecification,
  FillExtrusionLayerSpecification,
  ExpressionSpecification,
  FilterSpecification,
} from "maplibre-gl";

// Theme structure types
interface CategoryProperties {
  fillColor?: string;
  strokeColor?: string;
  fillOpacity?: number;
  strokeOpacity?: number;
  extrusionHeight?: number;
  strokeWidth?: number;
}

interface Theme {
  default?: CategoryProperties;
  [categoryName: string]: CategoryProperties | undefined;
}

// Utility function to get effective value from category or default properties
const getEffectiveValue = <T>(
  catProps: CategoryProperties,
  defProps: CategoryProperties,
  key: keyof CategoryProperties,
  fallback: T,
): T => {
  const val = catProps[key];
  if (val === undefined || val === null) {
    const defVal = defProps[key];
    return defVal !== undefined && defVal !== null ? (defVal as T) : fallback;
  }
  return val as T;
};

// Create MapLibre expression for mapping categories to property values
const createCategoryExpression = (
  theme: Theme,
  defaultProps: CategoryProperties,
  propertyName: keyof CategoryProperties,
  fallback: any,
): ExpressionSpecification => {
  const cases: any[] = [];

  for (const [catName, catProps] of Object.entries(theme)) {
    if (catName === "default" || !catProps) {
      continue;
    }

    const cleanCatName = catName.startsWith(".")
      ? catName.substring(1)
      : catName;
    let value = getEffectiveValue(
      catProps,
      defaultProps,
      propertyName,
      fallback,
    );

    // Convert to float for numeric properties
    if (
      [
        "fillOpacity",
        "strokeOpacity",
        "extrusionHeight",
        "strokeWidth",
      ].includes(propertyName)
    ) {
      value = parseFloat(value as string);
    }

    // Add condition and value for this category
    cases.push(["==", ["get", "category"], cleanCatName], value);
  }

  // Add default value at the end
  const defaultValue = defaultProps[propertyName] ?? fallback;
  cases.push(defaultValue);

  return ["case", ...cases] as ExpressionSpecification;
};

// Get categories that have a specific opacity level
const getCategoriesByOpacity = (
  theme: Theme,
  defaultProps: CategoryProperties,
  opacityLevel: number,
): string[] => {
  const categories: string[] = [];

  for (const [catName, catProps] of Object.entries(theme)) {
    if (catName === "default" || !catProps) {
      continue;
    }

    const cleanCatName = catName.startsWith(".")
      ? catName.substring(1)
      : catName;
    const effectiveOpacity = getEffectiveValue(
      catProps,
      defaultProps,
      "fillOpacity",
      1.0,
    );

    // Round to 1 decimal place
    const roundedOpacity =
      Math.round(parseFloat(effectiveOpacity as any) * 10) / 10;

    if (roundedOpacity === opacityLevel) {
      categories.push(cleanCatName);
    }
  }

  return categories;
};

// Create opacity filter for features
const createOpacityFilter = (
  opacityLevel: number,
  categoriesForOpacity: string[],
): FilterSpecification => {
  const conditions: any[] = [];

  // Condition 1: Feature has fillOpacity and matches the level
  conditions.push([
    "all",
    ["has", "fillOpacity"],
    ["==", ["round", ["*", ["get", "fillOpacity"], 10]], opacityLevel * 10],
  ]);

  // Condition 2: Feature doesn't have fillOpacity but its category has this opacity
  if (categoriesForOpacity.length > 0) {
    const categoryConditions: any[] = [];
    for (const catName of categoriesForOpacity) {
      categoryConditions.push(["==", ["get", "category"], catName]);
    }

    conditions.push([
      "all",
      ["!", ["has", "fillOpacity"]],
      ["any", ...categoryConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
};

// Create extrusion filter
const createExtrusionFilter = (
  theme: Theme,
  defaultProps: CategoryProperties,
): FilterSpecification => {
  // Get categories that have extrusion defined
  const categoriesWithExtrusion: string[] = [];

  for (const [catName, catProps] of Object.entries(theme)) {
    if (catName === "default" || !catProps) {
      continue;
    }

    const cleanCatName = catName.startsWith(".")
      ? catName.substring(1)
      : catName;
    const effectiveExtrusion = getEffectiveValue(
      catProps,
      defaultProps,
      "extrusionHeight",
      0,
    );

    if (
      effectiveExtrusion !== null &&
      parseFloat(effectiveExtrusion as string) > 0
    ) {
      categoriesWithExtrusion.push(cleanCatName);
    }
  }

  const conditions: any[] = [];

  // Condition 1: Feature has extrusionHeight > 1 defined
  conditions.push([
    "all",
    ["has", "extrusionHeight"],
    [">", ["get", "extrusionHeight"], 1],
  ]);

  // Condition 2: Feature doesn't have extrusionHeight but its category has extrusion defined
  if (categoriesWithExtrusion.length > 0) {
    const categoryConditions: any[] = [];
    for (const catName of categoriesWithExtrusion) {
      categoryConditions.push(["==", ["get", "category"], catName]);
    }

    conditions.push([
      "all",
      ["!", ["has", "extrusionHeight"]],
      ["any", ...categoryConditions],
    ]);
  }

  return ["any", ...conditions] as FilterSpecification;
};

// Create extrusion layer for specific opacity level
const createExtrusionLayer = (
  theme: Theme,
  defaultProps: CategoryProperties,
  opacityLevel: number,
  selectedFloorId = 0,
): FillExtrusionLayerSpecification => {
  // Get categories that have this opacity
  const categoriesForOpacity = getCategoriesByOpacity(
    theme,
    defaultProps,
    opacityLevel,
  );

  // Create opacity filter
  const opacityFilter = createOpacityFilter(opacityLevel, categoriesForOpacity);

  // Create extrusion filter
  const extrusionFilter = createExtrusionFilter(theme, defaultProps);

  // Complete filter for extrusion: must meet geometry, opacity AND extrusion
  const layerFilter = [
    "all",
    ["==", ["geometry-type"], "Polygon"],
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
      ["get", "extrusionHeight"],
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

// Create standard layer (flat, stroke, line)
const createLayer = (
  layerType: "flat" | "stroke" | "line",
  theme: Theme,
  defaultProps: CategoryProperties,
  selectedFloorId = 0,
): LayerSpecification => {
  let layerFilter: FilterSpecification;

  // Base filter according to layer type
  if (layerType === "flat" || layerType === "stroke") {
    // For flat/stroke: polygons without extrusion or with extrusion = 0
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "Polygon"],
      [
        "any",
        ["!", ["has", "extrusionHeight"]],
        ["==", ["get", "extrusionHeight"], 0],
      ],
      // Initialize floor id selection
      ["==", ["get", "floor_id"], selectedFloorId],
    ];
  } else if (layerType === "line") {
    // For line: LineString geometries
    layerFilter = [
      "all",
      ["==", ["geometry-type"], "LineString"],
      // Initialize floor id selection
      ["==", ["get", "floor_id"], selectedFloorId],
    ];
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
        ["get", "fillOpacity"],
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
        ["get", "strokeWidth"],
        createCategoryExpression(theme, defaultProps, "strokeWidth", 1),
      ] as ExpressionSpecification,
      "line-opacity": [
        "case",
        ["has", "fillOpacity"],
        ["get", "fillOpacity"],
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
        ["get", "strokeWidth"],
        createCategoryExpression(theme, defaultProps, "strokeWidth", 1),
      ] as ExpressionSpecification,
      "line-opacity": [
        "case",
        ["has", "strokeOpacity"],
        ["get", "strokeOpacity"],
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
