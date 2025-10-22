import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldForm from "@/components/molecules/field/field-form";
import FieldString from "@/components/molecules/field/field-string";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { validateURL } from "@/libs/form";

interface VectorTileJSONSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const VectorTileJSONSourceEditor: React.FC<VectorTileJSONSourceEditorProps> = ({
	control,
}) => {
	const { t } = useTranslation();

	return (
		<FieldForm
			name="url"
			control={control}
			rules={{
				required: t("URL required"),
				validate: (v) => validateURL(v),
			}}
		>
			{({ value, onChange, onBlur }) => (
				<FieldString
					label={t("TileJSON URL")}
					description={latest.source_vector.url.doc}
					required
					placeholder={t("Enter here the URL")}
					value={value as string}
					onChange={onChange}
					onBlur={onBlur}
				/>
			)}
		</FieldForm>
	);
};

export default VectorTileJSONSourceEditor;
