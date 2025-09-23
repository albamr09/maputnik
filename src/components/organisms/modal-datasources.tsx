import Modal from "@/components/molecules/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalsState } from "@/store/slices/uiSlice";
import { useTranslation } from "react-i18next";

const ModalDatasources = () => {
  const dispatch = useAppDispatch();
  const modalsState = useAppSelector(selectModalsState);

  const { t } = useTranslation();

  return (
    <Modal
      isOpen={modalsState.sources}
      onClose={() => dispatch(closeModal("sources"))}
      title={t("Data Sources")}
      description={t("Define which sources to use while styling your map.")}
      cancelText={t("Close")}
      size="xl"
    >
      Test
    </Modal>
  );
};

export default ModalDatasources;
