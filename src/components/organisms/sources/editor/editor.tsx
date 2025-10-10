import { SourceSpecification } from "maplibre-gl";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import FieldSelect from "@/components/molecules/field/field-select";
import FieldString from "@/components/molecules/field/field-string";
import Scrollable from "@/components/molecules/layout/scrollable";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
import { generateAndCheckRandomString } from "@/libs/random";
import { showError, showSuccess } from "@/libs/toast";
import { useAppSelector } from "@/store/hooks";
import { selectStyleSourceIds } from "@/store/slices/styleSlice";
import { SourceTypeMap, SourceTypes, SourceTypesType } from "@/store/types";
import GeoJSONSourceEditor from "./geojson-source";
import GeoJSONURLEditor from "./geojson-url-source";
import { SourceOnChange } from "./types";

interface SourceEditorProps<K extends SourceTypesType> {
	sourceId?: string;
	sourceType?: K;
	source?: SourceTypeMap[K];
	showSourceId?: boolean;
	showSourceType?: boolean;
	onSourceSaved?: () => void;
}

export interface SourceEditorRef {
	saveSource: () => void;
}

const SourceEditor = forwardRef(
	<K extends SourceTypesType>(
		{
			sourceId,
			source,
			sourceType,
			showSourceId = false,
			showSourceType = false,
			onSourceSaved = () => {},
		}: SourceEditorProps<K>,
		ref: React.Ref<SourceEditorRef>,
	) => {
		// Redux
		const mapStyleSourcesIds = useAppSelector(selectStyleSourceIds);

		// State
		const [localSourceId, setSourceId] = useState(
			sourceId ?? generateAndCheckRandomString(8, mapStyleSourcesIds),
		);
		const [localSource, setLocalSource] = useState<
			SourceSpecification | undefined
		>(source);
		const [localSourceType, setLocalSourceType] = useState<SourceTypesType>(
			sourceType ?? SourceTypes[0],
		);

		// Hooks
		const { t } = useTranslation();
		const { createDefaultSource, putLocalSource, updateSource } =
			useSourceEdition();

		useImperativeHandle(
			ref,
			() => ({
				saveSource: () => {
					// TODO ALBA: before adding check that there are no other sources with that id
					// if there is add popup asking user if it wants to ovewrite
					try {
						updateSource({ id: localSourceId, source: localSource! });
						onSourceSaved();
						showSuccess({
							title: t(`Source ${localSourceId} added successfully`),
						});
					} catch (e) {
						showError({
							title: t(`Could not add source ${localSourceId}`),
							description: `There was an error: ${e}`,
						});
					}
				},
			}),
			[localSourceId, localSource, onSourceSaved],
		);

		// Callbacks
		const setDefaultSource = useCallback((sourceType: SourceTypesType) => {
			setLocalSource(
				createDefaultSource({
					sourceType,
					source: {},
				}),
			);
		}, []);

		const onChange = useCallback(
			<K extends keyof SourceSpecification>(
				key: K,
				value: SourceSpecification[K],
			) => {
				setLocalSource((prevLocalSource) => {
					if (!prevLocalSource) return prevLocalSource;

					return putLocalSource({
						source: prevLocalSource!,
						diffSource: { [key]: value },
					});
				});
			},
			[],
		);

		const specificSourceFields = useMemo(() => {
			if (localSourceType === "geojson_url") {
				return (
					<GeoJSONURLEditor
						source={localSource as SourceTypeMap["geojson_url"]}
						onChange={onChange as SourceOnChange<SourceTypeMap["geojson_url"]>}
					/>
				);
			}

			if (localSourceType === "geojson_json") {
				return (
					<GeoJSONSourceEditor
						source={localSource as SourceTypeMap["geojson_json"]}
						onChange={onChange as SourceOnChange<SourceTypeMap["geojson_json"]>}
					/>
				);
			}
		}, [localSourceType, localSource]);

		return (
			<Scrollable maxHeight="300px">
				<div className="flex flex-col gap-5">
					{showSourceId && (
						<FieldString
							label={t("Source ID")}
							required
							description={t(
								"Unique ID that identifies the source and is used in the layer to reference the source.",
							)}
							placeholder={t("Enter here the identifier for you source")}
							value={localSourceId}
							onChange={(value) => {
								setSourceId(value);
							}}
						/>
					)}
					{showSourceType && (
						<FieldSelect
							label={t("Source Type")}
							required
							description={t("The type of the source.")}
							value={localSourceType}
							onChange={(value) => {
								setLocalSourceType(value as SourceTypesType);
								setDefaultSource(value as SourceTypesType);
							}}
							options={SourceTypes.map((type) => ({
								value: type,
								label: type,
							}))}
						/>
					)}

					{specificSourceFields}
				</div>
			</Scrollable>
		);
	},
);

export default SourceEditor;
