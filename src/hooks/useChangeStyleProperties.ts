import { useCallback } from "react";
import { cloneDeep } from "lodash";
import {
  LightSpecification,
  StyleSpecification,
  TerrainSpecification,
  TransitionSpecification,
} from "maplibre-gl";
import { useAppSelector } from "@/store/hooks";
import {
  selectMapStyle,
  selectMapStyleLight,
  selectMapStyleTerrain,
  selectMapStyleTransition,
} from "@/store/slices/styleCoreSlice";
import useStyleEdition from "@/hooks/useStyleEdition";

const useChangeStyleProperty = () => {
  const mapStyle = useAppSelector(selectMapStyle);
  const mapStyleTerrain = useAppSelector(selectMapStyleTerrain);
  const mapStyleLight = useAppSelector(selectMapStyleLight);
  const mapStyleTransition = useAppSelector(selectMapStyleTransition);

  const { onStyleChanged } = useStyleEdition();

  const changeStyleProperty = useCallback(
    (property: keyof StyleSpecification | "owner", value: any) => {
      const changedStyle = cloneDeep(mapStyle);

      if (value === undefined) {
        // @ts-ignore
        delete changedStyle[property];
      } else {
        // @ts-ignore
        changedStyle[property] = value;
      }
      onStyleChanged(changedStyle);
    },
    [mapStyle, onStyleChanged],
  );

  const changeMetadataProperty = useCallback(
    (property: string, value: any) => {
      const changedMetadata = cloneDeep(mapStyle?.metadata);

      if (!changedMetadata) return;

      if (value === undefined) {
        // @ts-ignore
        delete changedMetadata[property];
      } else {
        // @ts-ignore
        changedMetadata[property] = value;
      }

      onStyleChanged({ ...mapStyle, metadata: changedMetadata });
    },
    [mapStyle, onStyleChanged],
  );

  const changeTerrainProperty = useCallback(
    (
      property: keyof TerrainSpecification,
      value: string | number | undefined,
    ) => {
      if (!mapStyleTerrain) return;

      const changedTerrain = cloneDeep(mapStyleTerrain);
      if (value === undefined) {
        delete changedTerrain[property];
      } else {
        //@ts-ignore
        changedTerrain[property] = value;
      }

      onStyleChanged({
        ...mapStyle,
        terrain: changedTerrain,
      });
    },
    [mapStyle, mapStyleTerrain, onStyleChanged],
  );

  const changeTransitionProperty = useCallback(
    (property: keyof TransitionSpecification, value: number | undefined) => {
      if (!mapStyleTransition) return;
      const changedTransition = !mapStyleTransition
        ? {}
        : cloneDeep(mapStyleTransition);

      if (value === undefined) {
        delete changedTransition[property];
      } else {
        changedTransition[property] = value;
      }

      onStyleChanged({
        ...mapStyle,
        transition: changedTransition,
      });
    },
    [mapStyle, mapStyleTransition, onStyleChanged],
  );

  const changeLightProperty = useCallback(
    (property: keyof LightSpecification, value: any | undefined) => {
      const changedLight = !mapStyleLight ? {} : cloneDeep(mapStyleLight);

      if (value === undefined) {
        delete changedLight[property];
      } else {
        //@ts-ignore
        changedLight[property] = value;
      }

      onStyleChanged({
        ...mapStyle,
        light: changedLight,
      });
    },
    [mapStyle, mapStyleLight, onStyleChanged],
  );

  return {
    changeStyleProperty,
    changeMetadataProperty,
    changeTransitionProperty,
    changeTerrainProperty,
    changeLightProperty,
  };
};

export default useChangeStyleProperty;
