import Modal from "@/components/molecules/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeModal,
  selectModalOpenName,
  selectSelectedFloorId,
} from "@/store/slices/uiSlice";
import { useTranslation } from "react-i18next";
import FileDropZone from "@/components/molecules/file-dropzone";
import { useCallback } from "react";
import { readFileAsJSON } from "@/libs/file";
import { generateMapLibreLayers, Theme } from "@/libs/geojson-theme";
import {
  selectMapStyle,
  selectMapStyleLayers,
} from "@/store/slices/styleSlice";
import useStyleEdition from "@/hooks/edition/useStyleEdition";
import { showError, showSuccess } from "@/libs/toast";

const ModalGeoJSONTheme = () => {
  const dispatch = useAppDispatch();
  const modalOpenName = useAppSelector(selectModalOpenName);
  const mapStyleLayers = useAppSelector(selectMapStyleLayers);
  const mapStyle = useAppSelector(selectMapStyle);
  const selectedFloorId = useAppSelector(selectSelectedFloorId);

  const { t } = useTranslation();
  const { patchMapStyle } = useStyleEdition();

  const onGeoJSONThemeImported = useCallback(
    (file: File) => {
      readFileAsJSON<Theme>(file)
        .then((parsedTheme) => {
          // Generate layers from theme
          const generatedLayers = generateMapLibreLayers(
            parsedTheme,
            selectedFloorId,
          );

          // Remove previous generated layers
          const filteredLayers = mapStyleLayers.filter((layer) => {
            return !layer.id.includes("situm-geojson");
          });

          // Update style with new layers
          patchMapStyle({
            layers: [...filteredLayers, ...generatedLayers],
          });

          // Cleanup
          dispatch(closeModal());
          showSuccess({
            title: t("Layers generated successfully"),
          });
        })
        .catch((e) => {
          showError({
            title: t("Could not generate layers from GeoJSON theme"),
            description: `${t("There was an error:")} ${e.message}`,
          });
        });
    },
    [mapStyle, mapStyleLayers, selectedFloorId],
  );

  return (
    <Modal
      isOpen={modalOpenName == "geojson-theme"}
      onClose={() => dispatch(closeModal())}
      title={t("Import GeoJSON Theme")}
      description={t(
        "Load your GeoJSON Theme as layers on the map to style a given embedded GeoJSON",
      )}
      cancelText={t("Close")}
      size="xl"
    >
      <FileDropZone
        accept=".json"
        onFilesUploaded={(files) => {
          if (files.length == 0) return;
          onGeoJSONThemeImported(files[0]);
        }}
      />
    </Modal>
  );
};

export default ModalGeoJSONTheme;
