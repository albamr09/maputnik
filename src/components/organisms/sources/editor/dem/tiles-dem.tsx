import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FieldForm from "@/components/molecules/field/field-form";
import FieldNumber from "@/components/molecules/field/field-number";
import FieldSelect from "@/components/molecules/field/field-select";
import TilesSourceEditor from "@/components/organisms/sources/editor/tile/tiles";
import { SourceEditorForm } from "@/components/organisms/sources/editor/types";
import { validateTileSize } from "@/libs/form";

interface TilesDEMSourceEditorProps {
	control: Control<SourceEditorForm>;
}

const TilesDEMSourceEditor: React.FC<TilesDEMSourceEditorProps> = ({
	control,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<TilesSourceEditor control={control} />
			<FieldForm
				name="tileSize"
				control={control}
				rules={{
					required: t("Tile size is required"),
					min: {
						value: 1,
						message: t("Tile size must be greater than 0"),
					},
					validate: (v) => validateTileSize(v),
				}}
			>
				{({ value, onChange, onBlur }) => (
					<FieldNumber
						label={t("Tile Size")}
						description={latest.source_raster_dem.tileSize.doc}
						value={value}
						min={0}
						onChange={onChange}
						onBlur={onBlur}
					/>
				)}
			</FieldForm>
			<FieldForm name="encoding" control={control}>
				{({ value, onChange, onBlur }) => (
					<FieldSelect
						label={t("Encoding")}
						description={latest.source_raster_dem.encoding.doc}
						defaultValue={latest.source_raster_dem.encoding.default}
						value={value}
						//@ts-ignore
						onChange={onChange}
						onBlur={onBlur}
						options={Object.keys(latest.source_raster_dem.encoding.values).map(
							(encoding) => ({
								value: encoding,
								label: encoding,
							}),
						)}
					/>
				)}
			</FieldForm>
		</>
	);
};

export default TilesDEMSourceEditor;
