import { Check, X } from "lucide-react";
import { SourceSpecification } from "maplibre-gl";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import SectionTitle from "@/components/atoms/section-title";
import FieldSelect from "@/components/molecules/field/field-select";
import FieldString from "@/components/molecules/field/field-string";
import Scrollable from "@/components/molecules/layout/scrollable";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
import { generateAndCheckRandomString } from "@/libs/random";
import { useAppSelector } from "@/store/hooks";
import { selectStyleSourceIds } from "@/store/slices/styleSlice";
import { SourceTypes, SourceTypesType } from "@/store/types";
import SourceEditor from "./editor";

interface NewSourceProps {
	onAdd: ({ id, source }: { id: string; source: SourceSpecification }) => void;
	onCancel: () => void;
}

const NewSource: React.FC<NewSourceProps> = ({ onAdd, onCancel }) => {
	const mapStyleSourcesIds = useAppSelector(selectStyleSourceIds);

	const [sourceId, setSourceId] = useState(
		generateAndCheckRandomString(8, mapStyleSourcesIds),
	);
	const [sourceType, setSourceType] = useState<SourceTypesType>(SourceTypes[0]);
	const [localSource, setLocalSource] = useState<
		SourceSpecification | undefined
	>(undefined);

	const { t } = useTranslation();
	const { createDefaultSource, patchLocalSource } = useSourceEdition();

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
			<SectionTitle title={t("New Source")} />
			<Card>
				<CardContent className="p-0">
					<Scrollable maxHeight="300px">
						<div className="p-3 flex flex-col gap-5">
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

					<div className="flex p-3 gap-2 justify-end">
						<Button
							type="button"
							size="sm"
							onClick={() => onAdd({ id: sourceId, source: localSource! })}
						>
							<Check className="h-3 w-3" />
						</Button>
						<Button
							type="button"
							size="sm"
							variant="destructive"
							onClick={onCancel}
						>
							<X className="h-3 w-3" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default NewSource;
