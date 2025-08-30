import type { StyleSpecification, SourceSpecification } from "maplibre-gl";
import type { MapOptions } from "maplibre-gl";

// UI State Types
export type MapState = "map" | "inspect";

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
  index: number;
  key: string;
  message: string;
};

// Root State Type
export interface RootState {
  style: StyleState;
  ui: UIState;
  layers: LayersState;
  sources: SourcesState;
  errors: ErrorsState;
  mapView: MapViewState;
  debug: DebugState;
}

export type ExtendedStyleSpecification = StyleSpecification & { id: string };

// Individual Slice States
export interface StyleState {
  mapStyle: ExtendedStyleSpecification;
  dirtyMapStyle?: StyleSpecification;
  spec: any;
  fileHandle: FileSystemFileHandle | null;
}

export interface UIState {
  mapState: MapState;
  isOpen: ModalStates;
  selectedFloorId?: number;
  floorIds: number[];
  situmSDK: any | null;
}

export interface LayersState {
  selectedLayerIndex: number;
  selectedLayerOriginalId?: string;
  vectorLayers: {};
}

export interface SourcesState {
  sources: { [key: string]: SourceSpecification };
}

export interface ErrorsState {
  errors: MappedError[];
  infos: string[];
}

export interface MapViewState {
  mapView: MapView;
}

export interface DebugState {
  maplibreGlDebugOptions: MaplibreGlDebugOptions;
  openLayersDebugOptions: OpenLayersDebugOptions;
}
