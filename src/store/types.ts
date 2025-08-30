import type { StyleSpecification, SourceSpecification, MapOptions } from "maplibre-gl";

// UI State Types
export type MapState = "map" | "inspect" | "filter-achromatopsia" | "filter-deuteranopia" | "filter-protanopia" | "filter-tritanopia";

export type ModalStates = {
  settings: boolean;
  sources: boolean;
  open: boolean;
  shortcuts: boolean;
  export: boolean;
  debug: boolean;
};

export type MapView = {
  zoom: number;
  center: {
    lng: number;
    lat: number;
  };
};

// Avoid type errors for MapOptions due to strict type checking
type SafeMapOptions = Partial<Record<keyof MapOptions, unknown>>;
export type MaplibreGlDebugOptions = Partial<SafeMapOptions> & {
  showTileBoundaries: boolean;
  showCollisionBoxes: boolean;
  showOverdrawInspector: boolean;
};

export type OpenLayersDebugOptions = {
  debugToolbox: boolean;
};

// Error Types
export type MappedError = {
  message: string;
  parsed?: {
    type: string;
    data: {
      index: number;
      key: string;
      message: string;
    };
  };
};

export type ExtendedStyleSpecification = StyleSpecification & { id: string };

export interface StyleCoreState {
  // Style-related state
  mapStyle: ExtendedStyleSpecification;
  dirtyMapStyle?: ExtendedStyleSpecification;
  spec: any;
  fileHandle: FileSystemFileHandle | null;

  // Sources-related state
  sources: { [key: string]: SourceSpecification };

  // Layers-related state
  selectedLayerIndex: number;
  selectedLayerOriginalId?: string;
  vectorLayers: {};

  // Debug-related state
  maplibreGlDebugOptions: MaplibreGlDebugOptions;
  openLayersDebugOptions: OpenLayersDebugOptions;
}

export interface UICoreState {
  // UI-related state
  mapState: MapState;
  isOpen: ModalStates;
  selectedFloorId?: number;
  floorIds: number[];

  // Errors-related state
  errors: MappedError[];
  infos: string[];

  // MapView-related state
  mapView: MapView;
}

// Root State Type
export interface RootState {
  styleCore: StyleCoreState;
  uiCore: UICoreState;
}