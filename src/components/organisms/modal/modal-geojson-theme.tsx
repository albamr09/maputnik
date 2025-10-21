import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import FileDropZone from "@/components/molecules/file-dropzone";
import Modal from "@/components/molecules/layout/modal";
import FieldString from "@/components/molecules/field/field-string";
import useStyleEdition from "@/hooks/edition/useStyleEdition";
import { readFileAsJSON } from "@/libs/file";
import {
	DEFAULT_GEOJSON_SOURCE_ID,
	generateMapLibreLayers,
	Theme,
} from "@/libs/geojson-theme";
import { showError, showSuccess } from "@/libs/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectMapStyle,
	selectMapStyleLayers,
} from "@/store/slices/styleSlice";
import {
	closeModal,
	selectModalOpenName,
	selectSelectedFloorId,
} from "@/store/slices/uiSlice";

const ModalGeoJSONTheme = () => {
	const dispatch = useAppDispatch();
	const modalOpenName = useAppSelector(selectModalOpenName);
	const mapStyleLayers = useAppSelector(selectMapStyleLayers);
	const mapStyle = useAppSelector(selectMapStyle);
	const selectedFloorId = useAppSelector(selectSelectedFloorId);

	const [sourceId, setSourceId] = useState(DEFAULT_GEOJSON_SOURCE_ID);

	const { t } = useTranslation();
	const { patchMapStyle } = useStyleEdition();

	const onGeoJSONThemeImported = useCallback(
		(file: File) => {
			readFileAsJSON<Theme>(file)
				.then((parsedTheme) => {
					// Generate layers from theme
					const generatedLayers = generateMapLibreLayers(
						parsedTheme,
						sourceId,
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
		[mapStyle, mapStyleLayers, selectedFloorId, sourceId],
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
			<div className="flex gap-5 flex-col">
				<FieldString
					label={t("Source Id")}
					placeholder={t("Enter source id")}
					description={t(
						"ID of the source these layers should use. The layers generated will style and reference this source on the map.",
					)}
					value={sourceId}
					onChange={(value) => {
						setSourceId(value);
					}}
				/>
				<FileDropZone
					accept=".json"
					onFilesUploaded={(files) => {
						if (files.length == 0) return;
						onGeoJSONThemeImported(files[0]);
					}}
				/>
			</div>
		</Modal>
	);
};

export default ModalGeoJSONTheme;
