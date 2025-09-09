import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/atoms/menubar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectMapViewMode,
  setMapViewMode,
  toggleModal,
} from "@/store/slices/uiCoreSlice";
import { supportedLanguages } from "@/i18n";
import { withTranslation, WithTranslationProps } from "react-i18next";

// TODO ALBA: add translations
const ToolbarInternal = (props: WithTranslationProps) => {
  const dispach = useAppDispatch();
  const mapViewMode = useAppSelector(selectMapViewMode);

  // TODO ALBA: add logo

  return (
    <Menubar className="justify-end">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() => {
              dispach(toggleModal("open"));
            }}
          >
            Open file...
          </MenubarItem>
          <MenubarItem
            onClick={() => {
              dispach(toggleModal("export"));
            }}
          >
            Save file...
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() => {
              dispach(toggleModal("sources"));
            }}
          >
            Datasources...
          </MenubarItem>
          <MenubarItem
            onClick={() => {
              dispach(toggleModal("settings"));
            }}
          >
            Metadata...
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Process GeoJSON Theme</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem
            checked={mapViewMode === "map"}
            onClick={() => {
              dispach(setMapViewMode("map"));
            }}
          >
            Map View
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={mapViewMode === "inspect"}
            onClick={() => {
              dispach(setMapViewMode("inspect"));
            }}
          >
            Inspect View
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Settings</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={props.i18n?.language}>
            {Object.entries(supportedLanguages).map(([code, name]) => {
              return (
                <MenubarRadioItem
                  value={code}
                  onClick={() => {
                    props.i18n?.changeLanguage(code);
                  }}
                >
                  {name}
                </MenubarRadioItem>
              );
            })}
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem>Profile...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

const Toolbar = withTranslation()(ToolbarInternal);
export default Toolbar;
