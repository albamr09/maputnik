import type {
  StyleSpecification,
  SourceSpecification,
  MapOptions,
} from "maplibre-gl";

export type MapViewMode = "map" | "inspect";

export type ModalName =
  | "metadata"
  | "sources"
  | "import"
  | "profile"
  | "geojson-theme"
  | "shortcuts"
  | "debug";

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

export const SitumEnvironment = ["pro", "pre", "des"] as const;
export type SitumEnvironmentType = (typeof SitumEnvironment)[number];

export interface UICoreState {
  // UI-related state
  mapViewMode: MapViewMode;
  modalOpenName?: ModalName;

  // Situm
  apikey?: string;
  buildingId?: number;
  selectedFloorId?: number;
  floorIds: number[];
  environment: SitumEnvironmentType;

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
  style: StyleCoreState;
  styleStore: StyleStoreState;
  ui: UICoreState;
}
