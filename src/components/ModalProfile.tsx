import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import Modal from "./Modal";

import FieldString from "./FieldString";
import FieldEnum from "./FieldEnum";
import InputButton from "./InputButton";

type ModalProfileInternalProps = {
  isOpen: boolean;
  situmApiKey?: string;
  situmBuildingId?: string;
  situmEnvironment?: string;
  onOpenToggle(...args: unknown[]): unknown;
  onChangeProperty(...args: unknown[]): unknown;
} & WithTranslation;

type ModalProfileInternalState = {
  apikey?: string;
  buildingId?: string;
  env?: string;
}

class ModalProfileInternal extends React.Component<ModalProfileInternalProps, ModalProfileInternalState> {
  constructor(props: ModalProfileInternalProps) {
    super(props);
    this.state = {
      apikey: props.situmApiKey,
      buildingId: props.situmBuildingId,
      env: props.situmEnvironment
    }
  }

  onOpenToggle() {
    this.props.onOpenToggle();
  }

  disableSave() {
    return this.state.apikey == null || this.state.apikey == undefined || this.state.apikey == "" ||
      this.state.buildingId == null || this.state.buildingId == undefined || this.state.buildingId == "" ||
      this.state.env == null || this.state.env == undefined || this.state.env == ""
  }

  onSave() {
    this.props.onChangeProperty("apikey", this.state.apikey);
    this.props.onChangeProperty("building-id", this.state.buildingId);
    this.props.onChangeProperty("environment", this.state.env);
    this.onOpenToggle();
  }

  render() {
    const t = this.props.t;

    return (
      <div>
        <Modal
          data-wd-key="modal:profile"
          isOpen={this.props.isOpen}
          onOpenToggle={() => this.onOpenToggle()}
          title={t("Profile")}
        >
          <p>{t("Set up your Situm Account Authentication.")}</p>
          <div className="modal-settings">
            <FieldString
              label={t("Situm API Key")}
              fieldSpec={{
                doc: t(
                  "APIKey that is currently being used to access Situm's services",
                ),
              }}
              data-wd-key="modal:settings.maputnik:situm-apikey"
              value={this.state.apikey}
              onChange={(value) => this.setState({ apikey: value })}
            />
            <FieldString
              label={t("Situm Building ID")}
              data-wd-key="modal:settings.maputnik:situm-building-id"
              fieldSpec={{
                doc: t("Current Situm building ID"),
              }}
              value={this.state.buildingId}
              onChange={(value) => this.setState({ buildingId: value })}
            />
            <FieldEnum
              label={t("Environment")}
              fieldSpec={{
                doc: t("Select Situm API environment"),
              }}
              value={this.state.env}
              options={["des", "pre", "pro"]}
              default={"pro"}
              onChange={(value: string) => this.setState({ env: value })}
            />
            <InputButton 
              disabled={this.disableSave()}
              onClick={this.onSave.bind(this)}>
              {t("OK")}
            </InputButton>
          </div>
        </Modal>
      </div>
    );
  }
}

const ModalProfile = withTranslation()(ModalProfileInternal);
export default ModalProfile;
