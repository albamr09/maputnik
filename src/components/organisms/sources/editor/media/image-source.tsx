import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldArray from "@/components/molecules/field/field-array";
import FieldForm from "@/components/molecules/field/field-form";
import FieldNumber from "@/components/molecules/field/field-number";
import FieldString from "@/components/molecules/field/field-string";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { validateURL } from "@/libs/form";

interface ImageSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const ImageSourceEditor: React.FC<ImageSourceEditorProps> = ({ control }) => {
	const { t } = useTranslation();

	return (
		<>
			<FieldForm
				name="url"
				control={control}
				rules={{
					required: t("An URL is required"),
					validate: (v) => validateURL(v),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldString
						label={t("Image URL")}
						required
						description={latest.source_image.url.doc}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
			{Array.from({ length: latest.source_image.coordinates.length }).map(
				(_, i) => (
					<FieldForm
						key={i}
						// @ts-ignore
						name={`coordinates.${i}`}
						control={control}
					>
						{({ value, onChange, onBlur }) => (
							<FieldArray
								label={t(`Coordinate ${i + 1}`)}
								description={latest.source_image.coordinates.doc}
								Component={FieldNumber}
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								canAdd={false}
								getDefaultValue={() => value?.[0] || 0}
							/>
						)}
					</FieldForm>
				),
			)}
		</>
	);
};

export default ImageSourceEditor;
