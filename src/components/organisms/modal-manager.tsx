import ModalMetadata from "@/components/organisms/modal-metadata";
import ModalDatasources from "@/components/organisms/modal-datasources";
import ModalOpen from "@/components/organisms/modal-open";
import ModalProfile from "@/components/organisms/modal-profile";
import ModalGeoJSONTheme from "@/components/organisms/modal-geojson-theme";

const ModalManager = () => {
  return (
    <>
      <ModalMetadata />
      <ModalDatasources />
      <ModalOpen />
      <ModalProfile />
      <ModalGeoJSONTheme />
    </>
  );
};

export default ModalManager;

//        <ModalDebug
//          maplibreGlDebugOptions={maplibreGlDebugOptions}
//          onChangeMaplibreGlDebug={onChangeMaplibreGlDebug}
//          isOpen={modalsState.debug}
//          onOpenToggle={() => toggleModalHandler("debug")}
//          mapView={mapView}
//        />
//        <ModalShortcuts
//          isOpen={modalsState.shortcuts}
//          onOpenToggle={() => toggleModalHandler("shortcuts")}
//        />
//        <ModalSettings
//          mapStyle={mapStyle}
//          onStyleChanged={onStyleChanged}
//          onChangeMetadataProperty={onChangeMetadataProperty}
//          isOpen={modalsState.settings}
//          onOpenToggle={() => toggleModalHandler("settings")}
//        />
//        <ModalSources
//          mapStyle={mapStyle}
//          onStyleChanged={onStyleChanged}
//          isOpen={modalsState.sources}
//          onOpenToggle={() => toggleModalHandler("sources")}
//        />
