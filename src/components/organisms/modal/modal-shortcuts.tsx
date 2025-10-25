import { t } from "i18next";
import Modal from "@/components/molecules/layout/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";

const ModalShortcuts = () => {
	const dispatch = useAppDispatch();
	const modalOpenName = useAppSelector(selectModalOpenName);

	return (
		<Modal
			isOpen={modalOpenName === "shortcuts"}
			title={t("Shortcuts")}
			onClose={() => dispatch(closeModal())}
			description={t("Configure debug options")}
			cancelText={t("Close")}
		>
			<div className="flex flex-col gap-5 px-2"></div>
		</Modal>
	);
};

export default ModalShortcuts;
