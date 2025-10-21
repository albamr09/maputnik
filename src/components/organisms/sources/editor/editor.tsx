import { SourceSpecification } from "maplibre-gl";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/atoms/form";
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
import { SourceEditorForm, SourceOnChange } from "./types";

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

		const form = useForm<SourceEditorForm>({
			defaultValues: {
				sourceId:
					sourceId ?? generateAndCheckRandomString(8, mapStyleSourcesIds),
				sourceType: sourceType ?? SourceTypes[0],
			},
			mode: "onChange",
		});

		useImperativeHandle(
			ref,
			() => ({
				saveSource: () => {
					form.handleSubmit(onSubmit)();
				},
			}),
			[localSource, onSourceSaved],
		);

		// Callbacks
		const _createDefaultSource = useCallback((sourceType: SourceTypesType) => {
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

					// Use put for changes without nesting
					return putLocalSource({
						source: prevLocalSource!,
						diffSource: { [key]: value },
					});
				});
			},
			[],
		);

		const onSubmit = useCallback(
			(values: SourceEditorForm) => {
				try {
					updateSource({ id: values.sourceId, source: localSource! });
					onSourceSaved();
					showSuccess({
						title: t(`Source ${values.sourceId} added successfully`),
					});
				} catch (e) {
					showError({
						title: t(`Could not add source ${values.sourceId}`),
						description: `There was an error: ${e}`,
					});
				}
			},
			[localSource],
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
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							{showSourceId && (
								<FormField
									control={form.control}
									name="sourceId"
									rules={{
										required: t("Source id required"),
										validate: (v) => {
											return !mapStyleSourcesIds.includes(v)
												? true
												: t("Source id already exists");
										},
									}}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<FieldString
													label={t("Source ID")}
													required
													description={t(
														"Unique ID that identifies the source and is used in the layer to reference the source.",
													)}
													value={field.value}
													onChange={field.onChange}
													onBlur={field.onBlur}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							{showSourceType && (
								<FormField
									control={form.control}
									name="sourceType"
									rules={{
										required: t("Source type required"),
										validate: (v) => {
											return SourceTypes.includes(v)
												? true
												: t("Source type not supported");
										},
									}}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<FieldSelect
													label={t("Source Type")}
													required
													description={t("The type of the source.")}
													options={SourceTypes.map((type) => ({
														value: type,
														label: type,
													}))}
													value={field.value}
													onChange={(value) => {
														field.onChange(value);
														setLocalSourceType(value as SourceTypesType);
														_createDefaultSource(value as SourceTypesType);
													}}
													onBlur={field.onBlur}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							{specificSourceFields}
						</form>
					</Form>
				</div>
			</Scrollable>
		);
	},
);

export default SourceEditor;
