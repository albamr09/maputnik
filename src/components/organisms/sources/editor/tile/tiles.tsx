import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { useMemo } from "react";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldArray from "@/components/molecules/field/field-array";
import FieldForm from "@/components/molecules/field/field-form";
import FieldNumber from "@/components/molecules/field/field-number";
import FieldSelect from "@/components/molecules/field/field-select";
import FieldString from "@/components/molecules/field/field-string";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { MAX_MAP_ZOOM, MIN_MAP_ZOOM } from "@/constants";
import { validateURL } from "@/libs/form";

interface TilesSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const TilesSourceEditor: React.FC<TilesSourceEditorProps> = ({ control }) => {
	const { t } = useTranslation();

	const schemeTypeOptions = useMemo(() => {
		return Object.keys(latest.source_vector.scheme.values).map((key) => ({
			value: key,
			label: key.toUpperCase(),
		}));
	}, []);

	return (
		<>
			<FieldForm
				name="tiles"
				control={control}
				rules={{
					required: t("At least one Tile URL is required"),
					validate: (v) => validateURL(v),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldArray
						label={t("Tile URLs")}
						description={latest.source_vector.tiles.doc}
						Component={FieldString}
						value={value}
						// @ts-ignore
						onChange={onChange}
						onBlur={onBlur}
						minItems={1}
						getDefaultValue={() => value?.[0] || ""}
					/>
				)}
			</FieldForm>
			<FieldForm
				name="scheme"
				control={control}
				rules={{
					required: t("Scheme type is required"),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldSelect
						label={t("Scheme Type")}
						description={latest.source_vector.scheme.doc}
            defaultValue={latest.source_vector.scheme.default}
						value={value}
						options={schemeTypeOptions}
						// @ts-ignore
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
			<FieldForm
				name="minzoom"
				control={control}
				rules={{
					required: t("Min zoom is required"),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldNumber
						label={t("Min Zoom")}
						description={latest.source_vector.minzoom.doc}
            defaultValue={latest.source_vector.minzoom.default}
						value={value}
						min={MIN_MAP_ZOOM}
						max={MAX_MAP_ZOOM}
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
			<FieldForm
				name="maxzoom"
				control={control}
				rules={{
					required: t("Max zoom is required"),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldNumber
						label={t("Max Zoom")}
						description={latest.source_vector.maxzoom.doc}
            defaultValue={latest.source_vector.maxzoom.default}
						value={value}
						min={MIN_MAP_ZOOM}
						max={MAX_MAP_ZOOM}
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
		</>
	);
};

export default TilesSourceEditor;
