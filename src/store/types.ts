import type {
  StyleSpecification,
  SourceSpecification,
  MapOptions,
} from "maplibre-gl";

export type MapViewMode = "map" | "inspect";

export type ModalStates = {
  settings: boolean;
  sources: boolean;
  open: boolean;
  shortcuts: boolean;
  debug: boolean;
};

export type MapView = {
  zoom: number;
  center: {
    lng: number;
    lat: number;
  };
};

type SafeMapOptions = Partial<Record<keyof MapOptions, unknown>>;
export type MaplibreGlDebugOptions = Partial<SafeMapOptions> & {
  showTileBoundaries: boolean;
  showCollisionBoxes: boolean;
  showOverdrawInspector: boolean;
};

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

export type ExtendedStyleSpecification = StyleSpecification & {
  id: string;
  owner?: string;
};

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
}

export interface UICoreState {
  // UI-related state
  mapViewMode: MapViewMode;
  modalsState: ModalStates;
  selectedFloorId?: number;
  floorIds: number[];

  // Errors-related state
  errors: MappedError[];
  infos: string[];

  // MapView-related state
  mapView: MapView;
}

export interface StyleStoreState {
  // Revisions
  revisions: ExtendedStyleSpecification[];
  currentIdx: number;

  // Style store
  storedStyles: string[];
}

// Root State Type
export interface RootState {
  styleCore: StyleCoreState;
  styleStore: StyleStoreState;
  uiCore: UICoreState;
}
