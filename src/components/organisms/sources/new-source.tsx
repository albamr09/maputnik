import { SourceSpecification } from "maplibre-gl";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import FieldSelect from "@/components/molecules/field/field-select";
import FieldString from "@/components/molecules/field/field-string";
import Scrollable from "@/components/molecules/layout/scrollable";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
import { generateAndCheckRandomString } from "@/libs/random";
import { showError, showSuccess } from "@/libs/toast";
import { useAppSelector } from "@/store/hooks";
import { selectStyleSourceIds } from "@/store/slices/styleSlice";
import { SourceTypes, SourceTypesType } from "@/store/types";
import SourceEditor from "./editor";

interface NewSourceProps {
	onNewSourceAdded: () => void;
}

export interface NewSourceRef {
	addSource: () => void;
}

const NewSource = forwardRef<NewSourceRef, NewSourceProps>(
	({ onNewSourceAdded }, ref) => {
		const mapStyleSourcesIds = useAppSelector(selectStyleSourceIds);

		const [sourceId, setSourceId] = useState(
			generateAndCheckRandomString(8, mapStyleSourcesIds),
		);
		const [sourceType, setSourceType] = useState<SourceTypesType>(
			SourceTypes[0],
		);
		const [localSource, setLocalSource] = useState<
			SourceSpecification | undefined
		>(undefined);

		const { t } = useTranslation();
		const { createDefaultSource, patchLocalSource, updateSource } =
			useSourceEdition();

		useImperativeHandle(
			ref,
			() => ({
				addSource: () => {
					// TODO ALBA: before adding check that there are no other sources with that id
					// if there is add popup asking user if it wants to ovewrite
					try {
						updateSource({ id: sourceId, source: localSource! });
						onNewSourceAdded();
						showSuccess({ title: t(`Source ${sourceId} added successfully`) });
					} catch (e) {
						showError({
							title: t(`Could not add source ${sourceId}`),
							description: `There was an error: ${e}`,
						});
					}
				},
			}),
			[sourceId, localSource, onNewSourceAdded],
		);

		const onChange = useCallback(
			<K extends keyof SourceSpecification>(
				key: K,
				value: SourceSpecification[K],
			) => {
				if (!localSource) return;

				const newSource = patchLocalSource({
					source: localSource,
					diffSource: { [key]: value },
				});

				setLocalSource(newSource);
			},
			[localSource],
		);

		const setDefaultSource = useCallback((sourceType: SourceTypesType) => {
			setLocalSource(
				createDefaultSource({
					sourceType,
					source: {},
				}),
			);
		}, []);

		return (
			<div className="flex flex-col gap-5">
				<Scrollable maxHeight="300px">
					<div className="flex flex-col gap-5">
						<FieldString
							label={t("Source ID")}
							required
							description={t(
								"Unique ID that identifies the source and is used in the layer to reference the source.",
							)}
							placeholder={t("Enter here the identifier for you source")}
							value={sourceId}
							onChange={(value) => {
								setSourceId(value);
							}}
						/>
						<FieldSelect
							label={t("Source Type")}
							required
							description={t("The type of the source.")}
							value={sourceType}
							onChange={(value) => {
								setSourceType(value as SourceTypesType);
								setDefaultSource(value as SourceTypesType);
							}}
							options={SourceTypes.map((type) => ({
								value: type,
								label: type,
							}))}
						/>

						<SourceEditor
							source={localSource!}
							sourceType={sourceType}
							onChange={onChange}
						/>
					</div>
				</Scrollable>
			</div>
		);
	},
);

export default NewSource;
