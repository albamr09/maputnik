import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/atoms/menubar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectMapViewMode,
  setMapViewMode,
  toggleModal,
} from "@/store/slices/uiCoreSlice";
import { supportedLanguages } from "@/i18n";
import { useTranslation } from "react-i18next";
import pkgJson from "../../../package.json";
import { Badge } from "@/components/atoms/badge";
import { createMapStyleHTML, saveMapStyle } from "@/libs/export";
import { selectMapStyle } from "@/store/slices/styleCoreSlice";
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { User } from "lucide-react";

const Toolbar = () => {
  const { t, i18n } = useTranslation();
  const dispach = useAppDispatch();
  const mapViewMode = useAppSelector(selectMapViewMode);
  const mapStyle = useAppSelector(selectMapStyle);

  return (
    <div className="flex items-center justify-between bg-background px-2">
      <a
        className="flex items-center gap-4"
        target="blank"
        rel="noreferrer noopener"
        href="https://github.com/albamr09/maputnik"
      >
        <img src="/img/maputnik.png" alt="Maputnik" className="h-6 w-6" />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg capitalize">
            {pkgJson.name.replace(/-/g, " ")}
          </span>
          <Badge variant="secondary" className="text-xxs">
            v{pkgJson.version}
          </Badge>
        </div>
      </a>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>{t("File")}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => {
                dispach(toggleModal("import"));
              }}
            >
              {t("Open style...")}
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                dispach(toggleModal("import"));
              }}
            >
              {
                // TODO ALBA: open modal to select options
                t("Import GeoJSON Theme")
              }
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>{t("Export style...")}</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem
                  onClick={() => {
                    saveMapStyle(mapStyle);
                  }}
                >
                  {t("Export as JSON")}
                </MenubarItem>
                <MenubarItem
                  onClick={() => {
                    createMapStyleHTML(mapStyle);
                  }}
                >
                  {t("Export as HTML")}
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>{t("Edit")}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => {
                dispach(toggleModal("sources"));
              }}
            >
              {t("Datasources")}
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                dispach(toggleModal("metadata"));
              }}
            >
              {t("Metadata")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>{t("View")}</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              checked={mapViewMode === "map"}
              onClick={() => {
                dispach(setMapViewMode("map"));
              }}
            >
              {t("Map View")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={mapViewMode === "inspect"}
              onClick={() => {
                dispach(setMapViewMode("inspect"));
              }}
            >
              {t("Inspect View")}
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="p-0">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </MenubarTrigger>
          <MenubarContent align="end">
            <MenubarItem
              onClick={() => {
                dispach(toggleModal("profile"));
              }}
            >
              {t("Profile")}
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>{t("Language")}</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarRadioGroup value={i18n?.language}>
                  {Object.entries(supportedLanguages).map(([code, name]) => {
                    return (
                      <MenubarRadioItem
                        key={code}
                        value={code}
                        onClick={() => {
                          i18n?.changeLanguage(code);
                        }}
                      >
                        {name}
                      </MenubarRadioItem>
                    );
                  })}
                </MenubarRadioGroup>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default Toolbar;
