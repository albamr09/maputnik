import Modal from "@/components/molecules/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeModal,
  selectApiKey,
  selectBuildingId,
  selectEnvironment,
  selectModalOpenName,
  setApiKey,
  setBuildingId,
  setEnvironment,
} from "@/store/slices/uiSlice";
import { useTranslation } from "react-i18next";
import FieldString from "@/components/molecules/field/field-string";
import FieldToggleGroup from "@/components/molecules/field/field-toggle-group";
import { SitumEnvironment, SitumEnvironmentType } from "@/store/types";
import FieldNumber from "@/components/molecules/field/field-number";
import useStylePropertyEdition from "@/hooks/edition/useStylePropertyEdition";
import {
  APIKEY_METADATA_KEY,
  BUILDING_ID_METADATA_KEY,
  ENVIRONMENT_METADATA_KEY,
} from "@/constants";

const ModalProfile = () => {
  const dispatch = useAppDispatch();
  const modalOpenName = useAppSelector(selectModalOpenName);
  const apiKey = useAppSelector(selectApiKey);
  const buildingId = useAppSelector(selectBuildingId);
  const environment = useAppSelector(selectEnvironment);

  const { t } = useTranslation();
  const { changeMetadataProperty } = useStylePropertyEdition();

  return (
    <Modal
      isOpen={modalOpenName == "profile"}
      onClose={() => dispatch(closeModal())}
      title={t("Profile")}
      description={t("Set up your Situm Account Authentication")}
      cancelText={t("Close")}
      size="xl"
      maxHeight="25vh"
    >
      <div className="flex flex-col gap-4">
        <FieldString
          label={t("Apikey")}
          placeholder={t("Enter here your apikey...")}
          description={t(
            "APIKey that is currently being used to access Situm's services",
          )}
          value={apiKey || ""}
          onChange={(value) => {
            dispatch(setApiKey(value));
            changeMetadataProperty(APIKEY_METADATA_KEY, value);
          }}
        />
        <FieldNumber
          label={t("Building ID")}
          description={t("The identifier of your building")}
          value={buildingId}
          onChange={(value) => {
            dispatch(setBuildingId(value));
            changeMetadataProperty(BUILDING_ID_METADATA_KEY, value);
          }}
        />
        <FieldToggleGroup
          label={t("Environment")}
          description={t("Define Situm API environment")}
          value={environment}
          onChange={(value) => {
            dispatch(setEnvironment(value as SitumEnvironmentType));
            changeMetadataProperty(ENVIRONMENT_METADATA_KEY, value);
          }}
          options={SitumEnvironment.map((env) => ({
            value: env,
            label: env.toUpperCase(),
          }))}
        />
      </div>
    </Modal>
  );
};

export default ModalProfile;
