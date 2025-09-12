import ModalMetadata from "@/components/organisms/modal-metadata";

const ModalManager = () => {
  return (
    <>
      <ModalMetadata />
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
//        <ModalExport
//          mapStyle={mapStyle}
//          onStyleChanged={onStyleChanged}
//          isOpen={modalsState.export}
//          onOpenToggle={() => toggleModalHandler("export")}
//          fileHandle={fileHandle}
//          onSetFileHandle={onSetFileHandle}
//        />
//        <ModalOpen
//          isOpen={modalsState.open}
//          onStyleOpen={openStyle}
//          onOpenToggle={() => toggleModalHandler("open")}
//          fileHandle={fileHandle}
//        />
//        <ModalSources
//          mapStyle={mapStyle}
//          onStyleChanged={onStyleChanged}
//          isOpen={modalsState.sources}
//          onOpenToggle={() => toggleModalHandler("sources")}
//        />
