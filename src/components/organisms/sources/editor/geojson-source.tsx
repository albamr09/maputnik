import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { useTranslation } from "react-i18next";
import FieldCheckbox from "@/components/molecules/field/field-checkbox";
import FieldJSON from "@/components/molecules/field/field-json";
import { SourceOnChange } from "@/components/organisms/sources/editor/types";
import { SourceTypeMap } from "@/store/types";

interface GeoJSONSourceEditorProps {
	source: SourceTypeMap["geojson_json"];
	onChange?: SourceOnChange<SourceTypeMap["geojson_json"]>;
}

const GeoJSONSourceEditor: React.FC<GeoJSONSourceEditorProps> = ({
	source,
	onChange = () => {},
}) => {
	const { t } = useTranslation();

	return (
		<>
			<FieldCheckbox
				label={t("Cluster")}
				description={latest.source_geojson.cluster.doc}
				onChange={(value) => onChange("cluster", value)}
				value={source.cluster}
			/>
			<FieldJSON
				label={t("Data")}
				value={source.data}
				description={latest.source_geojson.data.doc}
				onChange={(value) => onChange("data", value)}
			/>
		</>
	);
};

export default GeoJSONSourceEditor;
