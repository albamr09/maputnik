import Modal from "@/components/molecules/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";
import { useTranslation } from "react-i18next";
import ActiveSources from "@/components/organisms/sources/active-sources";
import NewSource from "@/components/organisms/sources/new-source";

const ModalDatasources = () => {
  const dispatch = useAppDispatch();
  const modalOpenName = useAppSelector(selectModalOpenName);

  const { t } = useTranslation();

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
        <NewSource />
      </div>
    </Modal>
  );
};

export default ModalDatasources;
