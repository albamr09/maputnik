import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import FileReaderInput, { Result } from "react-file-reader-input";

import Modal from "./Modal";

import { DEFAULT_GEOJSON_SOURCE_ID, generateMapLibreLayers } from "../libs/geojson-theme";
import { StyleSpecification } from "maplibre-gl";
import { GrCubes } from "react-icons/gr";
import style from "../libs/style";
import FieldString from "./FieldString";

type ModalProcessesInternalProps = {
  isOpen: boolean;
  onOpenToggle(...args: unknown[]): unknown;
  mapStyle: StyleSpecification;
  selectedFloorId: number;
  onStyleChanged(...args: unknown[]): unknown;
} & WithTranslation;

type ModalProcessesState = {
  sourceId: string;
};

class ModalProcessesInternal extends React.Component<ModalProcessesInternalProps, ModalProcessesState> {
  constructor(props: ModalProcessesInternalProps) {
    super(props);
    this.state = {
      sourceId: DEFAULT_GEOJSON_SOURCE_ID
    }
  }

  onOpenToggle() {
    this.props.onOpenToggle();
  }

  onGeoJSONThemeImport = async (_: any, files: Result[]) => {
    const [, file] = files[0];
    const reader = new FileReader();

    reader.readAsText(file, "UTF-8");
    reader.onload = (e) => {
      try {
        const geojsonTheme = JSON.parse(e.target?.result as string);
        const generatedLayers = generateMapLibreLayers(
          geojsonTheme,
          this.state.sourceId,
          this.props.selectedFloorId,
        );
        // @ts-ignore
        const filteredSitumLayers = (this.props.mapStyle?.layers || []).filter(
          // @ts-ignore
          (layer) => {
            return !layer.id.includes(`situm-${this.state.sourceId}`);
          },
        );
        const newStyle = {
          ...this.props.mapStyle,
          layers: [...filteredSitumLayers, ...generatedLayers],
        };
        const mapStyle = style.ensureStyleValidity(newStyle);
        this.props.onStyleChanged(mapStyle);
      } catch (err) {
        console.error(err);
        return;
      }
    };
    reader.onerror = (e) => console.log(e.target);
  };

  render() {
    const t = this.props.t;

    return (
      <div>
        <Modal
          data-wd-key="modal:processes"
          isOpen={this.props.isOpen}
          onOpenToggle={() => this.onOpenToggle()}
          title={t("Process Automatization")}
        >
          <p>
            {t("Set of utilities which aim to automatize common processes.")}
          </p>
          <div className="modal-settings">
            <div style={{display: 'flex', flexDirection: "column"}}>
              <h3>
                {t("GeoJSON Theme")}
              </h3>
              <p>
                {t("Convert your GeoJSON Theme to the corresponding Maplibre layers.")}
              </p>
              <FieldString
                label={t("Source Id")}
                fieldSpec={{doc: "Identification of the source to use for these layers"}}
                value={this.state.sourceId}
                onChange={(value) => {
                  if (!value) return;
                  this.setState({ sourceId: value });
                }}
              />
              <button
              >
                {/*@ts-ignore*/}
                <FileReaderInput
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                  }}
                  onChange={this.onGeoJSONThemeImport}
                  tabIndex={-1}
                >
                  <GrCubes />
                  {t("Process GeoJSON Theme")}
                </FileReaderInput>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

const ModalProcesses = withTranslation()(ModalProcessesInternal);
export default ModalProcesses;
