import { Check, Pencil, Trash2 } from "lucide-react";
import { SourceSpecification } from "maplibre-gl";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/atoms/card";
import SectionTitle from "@/components/atoms/section-title";
import SourceEditor from "@/components/organisms/sources/editor";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
import { getSourceType } from "@/libs/source";
import { useAppSelector } from "@/store/hooks";
import { selectStyleSources } from "@/store/slices/styleSlice";

interface ActiveSourceProps {
	id: string;
	source: SourceSpecification;
}

const ActiveSource: React.FC<ActiveSourceProps> = ({ id, source }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [localSource, setLocalSource] = useState(source);

	const { t } = useTranslation();
	const { deleteSource, patchLocalSource } = useSourceEdition();

	const toggleEdition = useCallback(() => {
		setIsEditing((p) => !p);
	}, []);

	const onChange = useCallback(
		<K extends keyof SourceSpecification>(
			key: K,
			value: SourceSpecification[K],
		) => {
			if (!source) return;

			const newSource = patchLocalSource({
				source,
				diffSource: { [key]: value },
			});

			setLocalSource(newSource);
		},
		[source],
	);

	const sourceType = useMemo(() => {
		return getSourceType(localSource);
	}, [localSource]);

	if (!sourceType) return;

	return (
		<Card key={id}>
			<CardHeader className="py-3 px-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<CardTitle className="text-base"># {id}</CardTitle>
						<Badge variant="secondary">{localSource.type}</Badge>
					</div>

					<div className="flex gap-1">
						<Button
							size="sm"
							variant={isEditing ? "default" : "outline"}
							onClick={() => toggleEdition()}
							title={isEditing ? t("Leave changes") : t("Edit source")}
						>
							{isEditing ? <Check /> : <Pencil />}
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => deleteSource(id)}
							title="Remove source"
						>
							<Trash2 size={16} />
						</Button>
					</div>
				</div>
			</CardHeader>
			{isEditing && (
				<CardContent>
					<SourceEditor
						sourceType={sourceType}
						source={localSource}
						onChange={onChange}
					/>
				</CardContent>
			)}
		</Card>
	);
};

const ActiveSources = () => {
	const mapStyleSources = useAppSelector(selectStyleSources);
	const { t } = useTranslation();
	return (
		<div className="flex flex-col gap-5">
			<SectionTitle title={t("Active Sources")} />
			{Object.entries(mapStyleSources).map(([id, source]) => (
				<ActiveSource key={id} id={id} source={source} />
			))}
		</div>
	);
};

export default ActiveSources;
