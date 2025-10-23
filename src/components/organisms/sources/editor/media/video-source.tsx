import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldArray from "@/components/molecules/field/field-array";
import FieldForm from "@/components/molecules/field/field-form";
import FieldNumber from "@/components/molecules/field/field-number";
import FieldString from "@/components/molecules/field/field-string";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { validateURLs } from "@/libs/form";

interface VideoSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const VideoSourceEditor: React.FC<VideoSourceEditorProps> = ({ control }) => {
	const { t } = useTranslation();

	return (
		<>
			<FieldForm
				name="urls"
				control={control}
				rules={{
					required: t("An URL is required"),
					validate: (v) => validateURLs(v),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldArray
						label={t("Video URL")}
						description={latest.source_image.coordinates.doc}
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

export default VideoSourceEditor;
