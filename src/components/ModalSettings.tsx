import React from "react";
import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import type {
  LightSpecification,
  StyleSpecification,
  TerrainSpecification,
  TransitionSpecification,
} from "maplibre-gl";
import { WithTranslation, withTranslation } from "react-i18next";

import FieldArray from "./FieldArray";
import FieldNumber from "./FieldNumber";
import FieldString from "./FieldString";
import FieldUrl from "./FieldUrl";
import FieldEnum from "./FieldEnum";
import FieldColor from "./FieldColor";
import Modal from "./Modal";
import fieldSpecAdditional from "../libs/field-spec-additional";

type ModalSettingsInternalProps = {
  mapStyle: StyleSpecification;
  onStyleChanged(...args: unknown[]): unknown;
  onChangeMetadataProperty(...args: unknown[]): unknown;
  isOpen: boolean;
  onOpenToggle(...args: unknown[]): unknown;
} & WithTranslation;

class ModalSettingsInternal extends React.Component<ModalSettingsInternalProps> {
  changeTransitionProperty(
    property: keyof TransitionSpecification,
    value: number | undefined,
  ) {
    const transition = {
      ...this.props.mapStyle.transition,
    };

    if (value === undefined) {
      delete transition[property];
    } else {
      transition[property] = value;
    }

    this.props.onStyleChanged({
      ...this.props.mapStyle,
      transition,
    });
  }

  changeLightProperty(property: keyof LightSpecification, value: any) {
    const light = {
      ...this.props.mapStyle.light,
    };

    if (value === undefined) {
      delete light[property];
    } else {
      // @ts-ignore
      light[property] = value;
    }

    this.props.onStyleChanged({
      ...this.props.mapStyle,
      light,
    });
  }

  changeTerrainProperty(property: keyof TerrainSpecification, value: any) {
    const terrain = {
      ...this.props.mapStyle.terrain,
    };

    if (value === undefined) {
      delete terrain[property];
    } else {
      // @ts-ignore
      terrain[property] = value;
    }

    this.props.onStyleChanged({
      ...this.props.mapStyle,
      terrain,
    });
  }

  changeStyleProperty(
    property: keyof StyleSpecification | "owner",
    value: any,
  ) {
    const changedStyle = {
      ...this.props.mapStyle,
    };

    if (value === undefined) {
      // @ts-ignore
      delete changedStyle[property];
    } else {
      // @ts-ignore
      changedStyle[property] = value;
    }
    this.props.onStyleChanged(changedStyle);
  }

  render() {
    const metadata = this.props.mapStyle.metadata || ({} as any);
    const { t, onChangeMetadataProperty } = this.props;

    return (
      <Modal
        data-wd-key="modal:settings"
        isOpen={this.props.isOpen}
        onOpenToggle={this.props.onOpenToggle}
        title={t("Style Settings")}
      >
        <div className="modal:settings">
          <FieldString
            label={t("Situm API Key")}
            fieldSpec={{
              doc: t(
                "APIKey that is currently being used to access Situm's services",
              ),
            }}
            data-wd-key="modal:settings.maputnik:situm-apikey"
            value={metadata["maputnik:situm-apikey"]}
            onChange={onChangeMetadataProperty.bind(
              this,
              "maputnik:situm-apikey",
            )}
          />

          <FieldString
            label={t("Situm Building ID")}
            data-wd-key="modal:settings.maputnik:situm-building-id"
            fieldSpec={{
              doc: t("Current Situm building ID"),
            }}
            value={metadata["maputnik:situm-building-id"]}
            onChange={onChangeMetadataProperty.bind(
              this,
              "maputnik:situm-building-id",
            )}
          />
        </div>
      </Modal>
    );
  }
}

const ModalSettings = withTranslation()(ModalSettingsInternal);
export default ModalSettings;
