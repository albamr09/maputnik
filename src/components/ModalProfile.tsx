import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import Modal from "./Modal";

import FieldString from "./FieldString";
import FieldEnum from "./FieldEnum";

type ModalProfileInternalProps = {
  isOpen: boolean;
  situmApiKey?: string;
  situmBuildingId?: string;
  situmEnvironment?: string;
  onOpenToggle(...args: unknown[]): unknown;
  onChangeProperty(...args: unknown[]): unknown;
} & WithTranslation;

class ModalProfileInternal extends React.Component<ModalProfileInternalProps> {
  constructor(props: ModalProfileInternalProps) {
    super(props);
  }

  onOpenToggle() {
    this.props.onOpenToggle();
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
              value={this.props.situmApiKey}
              onChange={this.props.onChangeProperty.bind(this, "apikey")}
            />
            <FieldString
              label={t("Situm Building ID")}
              data-wd-key="modal:settings.maputnik:situm-building-id"
              fieldSpec={{
                doc: t("Current Situm building ID"),
              }}
              value={this.props.situmBuildingId}
              onChange={this.props.onChangeProperty.bind(this, "building-id")}
            />
            <FieldEnum
              label={t("Environment")}
              fieldSpec={{
                doc: t("Select Situm API environment"),
              }}
              value={this.props.situmEnvironment}
              options={["des", "pre", "pro"]}
              default={"pro"}
              onChange={this.props.onChangeProperty.bind(this, "environment")}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

const ModalProfile = withTranslation()(ModalProfileInternal);
export default ModalProfile;
