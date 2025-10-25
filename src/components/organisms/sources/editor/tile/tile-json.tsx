import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldCheckbox from "@/components/molecules/field/field-checkbox";
import FieldForm from "@/components/molecules/field/field-form";
import FieldString from "@/components/molecules/field/field-string";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { validateURL } from "@/libs/form";
import { useSitumSDK } from "@/providers/SitumSDKProvider";

interface TileJSONSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const TileJSONSourceEditor: React.FC<TileJSONSourceEditorProps> = ({
	control,
}) => {
	const { t } = useTranslation();
	const { isAuthenticated: hasSitumAuth } = useSitumSDK();

	return (
		<>
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
			{hasSitumAuth && (
				<FieldForm name="situmAccessToken" control={control}>
					{({ value, onChange, onBlur }) => (
						<FieldCheckbox
							label={t("Use Situm Auth")}
							description={t(
								"Configure whether or not to use Situm's Authentication",
							)}
							value={value}
							onChange={onChange}
							onBlur={onBlur}
						/>
					)}
				</FieldForm>
			)}
		</>
	);
};

export default TileJSONSourceEditor;
