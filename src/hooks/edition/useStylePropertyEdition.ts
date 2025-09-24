import { useCallback } from "react";
import {
  LightSpecification,
  StyleSpecification,
  TerrainSpecification,
  TransitionSpecification,
} from "maplibre-gl";
import { useAppSelector } from "@/store/hooks";
import { selectMapStyle } from "@/store/slices/styleSlice";
import useStyleEdition from "@/hooks/edition/useStyleEdition";

const useStylePropertyEdition = () => {
  const mapStyle = useAppSelector(selectMapStyle);

  const { patchMapStyle } = useStyleEdition();

  const changeStyleProperty = useCallback(
    (property: keyof StyleSpecification | "owner", value: any) => {
      patchMapStyle({
        [property]: value === undefined ? undefined : value,
      });
    },
    [patchMapStyle],
  );

  const changeMetadataProperty = useCallback(
    (property: string, value: any) => {
      patchMapStyle({
        metadata: {
          [property]: value,
        },
      });
    },
    [mapStyle?.metadata, patchMapStyle],
  );

  const changeTerrainProperty = useCallback(
    <K extends keyof TerrainSpecification>(
      property: K,
      value: TerrainSpecification[K] | undefined,
    ) => {
      patchMapStyle({
        terrain: {
          [property]: value,
        },
      });
    },
    [patchMapStyle],
  );

  const changeTransitionProperty = useCallback(
    <K extends keyof TransitionSpecification>(
      property: K,
      value: TransitionSpecification[K] | undefined,
    ) => {
      patchMapStyle({
        transition: {
          [property]: value,
        },
      });
    },
    [patchMapStyle],
  );

  const changeLightProperty = useCallback(
    <K extends keyof LightSpecification>(
      property: K,
      value: LightSpecification[K] | undefined,
    ) => {
      patchMapStyle({
        light: {
          [property]: value,
        },
      });
    },
    [patchMapStyle],
  );

  return {
    changeStyleProperty,
    changeMetadataProperty,
    changeTransitionProperty,
    changeTerrainProperty,
    changeLightProperty,
  };
};

export default useStylePropertyEdition;
