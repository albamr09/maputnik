import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldCheckbox from "@/components/molecules/field/field-checkbox";
import FieldForm from "@/components/molecules/field/field-form";
import FieldJSON from "@/components/molecules/field/field-json";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";

interface GeoJSONSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const GeoJSONSourceEditor: React.FC<GeoJSONSourceEditorProps> = ({
	control,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<FieldForm name="cluster" control={control}>
				{({ value, onChange, onBlur }) => (
					<FieldCheckbox
						label={t("Cluster")}
						description={latest.source_geojson.cluster.doc}
						defaultValue={latest.source_geojson.cluster.default}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
			<FieldForm
				name="data"
				control={control}
				rules={{
					required: t("Data required"),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldJSON
						label={t("Data")}
						description={latest.source_geojson.data.doc}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
		</>
	);
};

export default GeoJSONSourceEditor;
