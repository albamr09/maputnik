import { Check, Pencil, Trash2, X } from "lucide-react";
import { SourceSpecification } from "maplibre-gl";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/atoms/card";
import Scrollable from "@/components/molecules/layout/scrollable";
import SourceEditor, {
	SourceEditorRef,
} from "@/components/organisms/sources/editor/editor";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
import { getSourceType } from "@/libs/source";
import { useAppSelector } from "@/store/hooks";
import { selectStyleSources } from "@/store/slices/styleSlice";

interface ActiveSourceProps {
	id: string;
	source: SourceSpecification;
	isExpanded: boolean;
	onSourceExpanded: (id: string) => void;
	onSourceCollapsed: (id: string) => void;
}

const ActiveSource: React.FC<ActiveSourceProps> = ({
	id,
	source,
	isExpanded,
	onSourceExpanded = () => {},
	onSourceCollapsed = () => {},
}) => {
	const activeSourceRef = useRef<SourceEditorRef>(null);

	// Hooks
	const { t } = useTranslation();
	const { deleteSource } = useSourceEdition();

	const sourceType = useMemo(() => {
		return getSourceType(source);
	}, [source]);

	// Callbacks
	const startEdition = useCallback(() => {
		onSourceExpanded(id);
	}, []);

	const cancelEdition = useCallback(() => {
		onSourceCollapsed(id);
	}, []);

	const onSourceSaved = useCallback(() => {
		onSourceCollapsed(id);
	}, []);

	if (!sourceType) return;

	return (
		<Card key={id}>
			<CardHeader className="py-3 px-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<CardTitle className="text-base"># {id}</CardTitle>
						<Badge variant="secondary">{source.type}</Badge>
					</div>

					<div className="flex gap-1">
						{isExpanded && (
							<Button
								size="sm"
								variant="outline"
								onClick={() => cancelEdition()}
								title={t("Cancel")}
							>
								<X />
							</Button>
						)}
						<Button
							size="sm"
							variant={isExpanded ? "default" : "outline"}
							onClick={() => {
								if (isExpanded) {
									activeSourceRef.current?.saveSource();
								} else {
									startEdition();
								}
							}}
							title={isExpanded ? t("Save changes") : t("Edit source")}
						>
							{isExpanded ? <Check /> : <Pencil />}
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
			{isExpanded && (
				<CardContent className="p-0">
					<div className="p-3 flex flex-col gap-5">
						<SourceEditor
							ref={activeSourceRef}
							maxHeight={"30vh"}
							sourceId={id}
							sourceType={sourceType}
							source={source}
							onSourceSaved={onSourceSaved}
						/>
					</div>
				</CardContent>
			)}
		</Card>
	);
};

const ActiveSources = () => {
	const mapStyleSources = useAppSelector(selectStyleSources);

	const [expandedSourceId, setExpandedSourceId] = useState<string | undefined>(
		undefined,
	);

	return (
		<div className="flex flex-col gap-5">
			{Object.entries(mapStyleSources).map(([id, source]) => (
				<ActiveSource
					key={id}
					isExpanded={id == expandedSourceId}
					onSourceExpanded={(id) => setExpandedSourceId(id)}
					onSourceCollapsed={() => setExpandedSourceId(undefined)}
					id={id}
					source={source}
				/>
			))}
		</div>
	);
};

export default ActiveSources;
