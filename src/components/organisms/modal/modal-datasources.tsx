import { Plus } from "lucide-react";
import { SourceSpecification } from "maplibre-gl";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import Modal from "@/components/molecules/layout/modal";
import ActiveSources from "@/components/organisms/sources/active-sources";
import NewSource from "@/components/organisms/sources/new-source";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
import { showError, showSuccess } from "@/libs/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";

const ModalDatasources = () => {
	const dispatch = useAppDispatch();
	const modalOpenName = useAppSelector(selectModalOpenName);
	const [showAddNewSource, setShowAddNewSource] = useState(false);

	const { t } = useTranslation();
	const { updateSource } = useSourceEdition();

	const onNewSourceAdded = useCallback(
		({ id, source }: { id: string; source: SourceSpecification }) => {
			// TODO ALBA: before adding check that there are no other sources with that id
			// if there is add popup asking user if it wants to ovewrite
			try {
				updateSource({ id, source });
				setShowAddNewSource(false);
				showSuccess({ title: t(`Source ${id} added successfully`) });
			} catch (e) {
				showError({
					title: t(`Could not add source ${id}`),
					description: `There was an error: ${e}`,
				});
			}
		},
		[updateSource],
	);

	return (
		<Modal
			isOpen={modalOpenName == "sources"}
			onClose={() => dispatch(closeModal())}
			title={t("Data Sources")}
			description={t("Define which sources to use while styling your map.")}
			cancelText={t("Close")}
			size="xl"
		>
			<div className="flex flex-col gap-8">
				<ActiveSources />
				{!showAddNewSource && (
					<Button
						type="button"
						size="sm"
						onClick={() => {
							setShowAddNewSource(true);
						}}
						className="flex"
					>
						{t("Add Source")}
						<Plus className="h-3 w-3" />
					</Button>
				)}
				{showAddNewSource && (
					<NewSource
						onAdd={onNewSourceAdded}
						onCancel={() => {
							setShowAddNewSource(false);
						}}
					/>
				)}
			</div>
		</Modal>
	);
};

export default ModalDatasources;
