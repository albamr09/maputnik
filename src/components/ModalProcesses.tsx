import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import FileReaderInput, { Result } from "react-file-reader-input";

import Modal from "./Modal";

import FieldString from "./FieldString";
import FieldEnum from "./FieldEnum";
import { generateMapLibreLayers } from "../libs/geojson-theme";
import { StyleSpecification } from "maplibre-gl";
import { GrCubes } from "react-icons/gr";
import { TbHexagon3D } from "react-icons/tb";

type ModalProcessesInternalProps = {
  isOpen: boolean;
  onOpenToggle(...args: unknown[]): unknown;
  mapStyle: StyleSpecification;
  selectedFloorId: number;
  onStyleChanged(...args: unknown[]): unknown;
} & WithTranslation;

class ModalProcessesInternal extends React.Component<ModalProcessesInternalProps> {
  constructor(props: ModalProcessesInternalProps) {
    super(props);
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
          this.props.selectedFloorId,
        );
        // @ts-ignore
        const filteredSitumLayers = (this.props.mapStyle?.layers || []).filter(
          // @ts-ignore
          (layer) => {
            return !layer.id.includes("situm-geojson");
          },
        );
        const newStyle = {
          ...this.props.mapStyle,
          layers: [...filteredSitumLayers, ...generatedLayers],
        };
        // @ts-ignore
        const mapStyle = style.ensureStyleValidity(newStyle);
        this.props.onStyleChanged(mapStyle);
      } catch (err) {
        console.error(err);
        return;
      }
    };
    reader.onerror = (e) => console.log(e.target);
  };

  on3DModelImport = async (_: any, files: Result[]) => {
    const [, file] = files[0];
    const reader = new FileReader();

    reader.readAsText(file, "UTF-8");
    reader.onload = (e) => {
      try {
        // TODO ALBA: apply compression
        console.log(e);
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
            <button>
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
            <button>
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
                <TbHexagon3D size={15} />
                {t("Compress 3D model")}
              </FileReaderInput>
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}

const ModalProcesses = withTranslation()(ModalProcessesInternal);
export default ModalProcesses;
