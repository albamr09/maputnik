import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { LightSpecification } from "maplibre-gl";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/atoms/separator";
import FieldArray from "@/components/molecules/field/field-array";
import FieldColor from "@/components/molecules/field/field-color";
import FieldNumber from "@/components/molecules/field/field-number";
import FieldString from "@/components/molecules/field/field-string";
import FieldToggleGroup from "@/components/molecules/field/field-toggle-group";
import Modal from "@/components/molecules/modal";
import useStylePropertyEdition from "@/hooks/edition/useStylePropertyEdition";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectMapStyle,
	selectMapStyleLight,
	selectMapStyleTerrain,
	selectMapStyleTransition,
} from "@/store/slices/styleSlice";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";

const ModalMetadata = () => {
	const dispatch = useAppDispatch();
	const modalOpenName = useAppSelector(selectModalOpenName);
	const mapStyle = useAppSelector(selectMapStyle);
	const mapStyleTerrain = useAppSelector(selectMapStyleTerrain);
	const mapStyleLight = useAppSelector(selectMapStyleLight);
	const mapStyleTransition = useAppSelector(selectMapStyleTransition);

	const { t } = useTranslation();
	const {
		changeStyleProperty,
		changeLightProperty,
		changeTerrainProperty,
		changeTransitionProperty,
	} = useStylePropertyEdition();

	return (
		<Modal
			isOpen={modalOpenName == "metadata"}
			onClose={() => dispatch(closeModal())}
			title={t("Style Metadata")}
			description={t("Change additional data about your map style.")}
			cancelText={t("Close")}
			size="xl"
		>
			<div className="flex flex-col gap-4">
				<FieldString
					label={t("Name")}
					placeholder={latest.$root.name.example}
					description={latest.$root.name.doc}
					value={mapStyle.name || ""}
					onChange={(value) => {
						changeStyleProperty("name", value);
					}}
				/>
				<FieldString
					label={t("Owner")}
					//@ts-ignore
					value={mapStyle.owner || ""}
					placeholder={t("Enter the name of the owner")}
					description={t(
						"Owner ID of the style. Used by Mapbox or future style APIs",
					)}
					onChange={(value) => {
						changeStyleProperty("owner", value);
					}}
				/>
				<FieldString
					label={t("Sprite URL")}
					value={mapStyle.sprite as string}
					placeholder={latest.$root.sprite.example}
					description={latest.$root.sprite.doc}
					onChange={(value) => {
						changeStyleProperty("sprite", value);
					}}
				/>
				<FieldString
					label={t("Glyph URL")}
					value={mapStyle.glyphs as string}
					placeholder={latest.$root.glyphs.example}
					description={latest.$root.glyphs.doc}
					onChange={(value) => {
						changeStyleProperty("glyphs", value);
					}}
				/>
				<Separator />
				<FieldArray
					label={t("Map Center")}
					itemLabels={["X", "Y"]}
					value={mapStyle.center || [0, 0]}
					description={latest.$root.center.doc}
					onChange={(value) => {
						changeStyleProperty("center", value);
					}}
					canAdd={false}
					Component={FieldNumber}
					getDefaultValue={() => 0}
				/>
				<FieldNumber
					label={t("Map Zoom")}
					value={mapStyle.zoom || latest.$root.zoom.example}
					description={latest.$root.zoom.doc}
					onChange={(value) => {
						changeStyleProperty("zoom", value);
					}}
				/>
				<FieldNumber
					label={t("Map Bearing")}
					value={mapStyle.bearing || latest.$root.bearing.example}
					description={latest.$root.bearing.doc}
					onChange={(value) => {
						changeStyleProperty("bearing", value);
					}}
				/>
				<FieldNumber
					label={t("Map Pitch")}
					value={mapStyle.pitch || latest.$root.pitch.example}
					description={latest.$root.pitch.doc}
					onChange={(value) => {
						changeStyleProperty("pitch", value);
					}}
				/>
				<Separator />
				<FieldToggleGroup
					label={t("Light Anchor")}
					description={latest.light.anchor.doc}
					value={
						mapStyleLight?.anchor?.toString() || latest.light.anchor.default
					}
					onChange={(value) => {
						changeLightProperty(
							"anchor",
							value as LightSpecification["anchor"],
						);
					}}
					options={Object.keys(latest.light.anchor.values).map((key) => ({
						value: key,
						label: key,
					}))}
				/>
				<FieldColor
					label={t("Light Color")}
					description={latest.light.color.doc}
					value={(mapStyleLight?.color as string) || latest.light.color.default}
					onChange={(value) => {
						changeLightProperty("color", value);
					}}
				/>
				<FieldNumber
					label={t("Light intensity")}
					value={
						(mapStyleLight?.intensity as number) ||
						latest.light.intensity.default
					}
					description={latest.light.intensity.doc}
					onChange={(value) => {
						changeLightProperty("intensity", value);
					}}
				/>
				<FieldArray
					label={t("Light Position")}
					itemLabels={["X", "Y", "Z"]}
					value={
						(mapStyleLight?.position as number[]) ||
						latest.light.position.default
					}
					description={latest.light.position.doc}
					onChange={(value) => {
						changeLightProperty(
							"position",
							value as LightSpecification["position"],
						);
					}}
					Component={FieldNumber}
					getDefaultValue={() => 0}
					canAdd={false}
				/>
				<Separator />
				<FieldString
					label={t("Terrain source")}
					value={mapStyleTerrain?.source || ""}
					description={latest.terrain.source.doc}
					onChange={(value) => {
						changeTerrainProperty("source", value);
					}}
				/>
				<FieldNumber
					label={t("Terrain exaggeration")}
					value={mapStyleTerrain?.exaggeration || 0}
					description={latest.terrain.exaggeration.doc}
					onChange={(value) => {
						changeTerrainProperty("exaggeration", value);
					}}
				/>
				<Separator />
				<FieldNumber
					label={t("Transition delay")}
					value={mapStyleTransition?.delay || 0}
					description={latest.transition.delay.doc}
					onChange={(value) => {
						changeTransitionProperty("delay", value);
					}}
				/>
				<FieldNumber
					label={t("Transition duration")}
					value={mapStyleTransition?.duration || 0}
					description={latest.transition.duration.doc}
					onChange={(value) => {
						changeTransitionProperty("duration", value);
					}}
				/>
			</div>
		</Modal>
	);
};

export default ModalMetadata;
