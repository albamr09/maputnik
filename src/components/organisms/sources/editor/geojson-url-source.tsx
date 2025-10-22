import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldForm from "@/components/molecules/field/field-form";
import FieldString from "@/components/molecules/field/field-string";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { validateURL } from "@/libs/form";

interface GeoJSONURLEditorProps {
	control: Control<SourceEditorForm>;
}

const GeoJSONURLEditor: React.FC<GeoJSONURLEditorProps> = ({ control }) => {
	const { t } = useTranslation();

	return (
		<FieldForm
			name="data"
			control={control}
			rules={{
				required: t("URL required"),
				validate: (v) => validateURL(v),
			}}
		>
			{({ value, onChange, onBlur }) => (
				<FieldString
					label={t("GeoJSON URL")}
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

export default GeoJSONURLEditor;
