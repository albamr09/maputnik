import publicStyles from "@/config/styles.json";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import { FileText, GalleryThumbnails } from "lucide-react";
import Modal from "@/components/molecules/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { useCallback } from "react";
import FileDropZone from "@/components/molecules/file-dropzone";
import { readFileAsJSON } from "@/libs/file";
import useStyleEdition from "@/hooks/edition/useStyleEdition";
import { ExtendedStyleSpecification } from "@/store/types";
import SectionTitle from "@/components/atoms/section-title";
import PreviewCard from "@/components/molecules/preview-card";
import FieldURL from "@/components/molecules/field/field-url";
import { showError, showSuccess } from "@/libs/toast";

const ModalOpen = () => {
  const dispatch = useAppDispatch();
  const modalOpenName = useAppSelector(selectModalOpenName);

  const { t } = useTranslation();
  const { setMapStyle } = useStyleEdition();

  const onOpenStyleFile = useCallback((file: File) => {
    readFileAsJSON<ExtendedStyleSpecification>(file)
      .then((parsedStyle) => {
        setMapStyle(parsedStyle);
        dispatch(closeModal());
        showSuccess({
          title: t("Style loaded successfully"),
        });
      })
      .catch((e) => {
        showError({
          title: t("Could not load style"),
          description: `${t("There was an error:")} ${e.message}`,
        });
      });
  }, []);

  const onOpenStyleURL = useCallback(
    (url: string | undefined) => {
      if (!url) {
        showError({
          title: t("Could not load style"),
          description: t("The URL you are trying to load is empty!"),
        });
        return;
      }
      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((parsedStyle) => {
          setMapStyle(parsedStyle);
          dispatch(closeModal());
          showSuccess({
            title: t("Style loaded successfully"),
          });
        })
        .catch((e) => {
          showError({
            title: t("Could not load style"),
            description: `${t("There was an error:")} ${e.message}`,
          });
        });
    },
    [setMapStyle],
  );

  return (
    <Modal
      isOpen={modalOpenName == "import"}
      onClose={() => dispatch(closeModal())}
      title={t("Open Style")}
      description={t(
        "Load your JSON style locally or remotely. You can also choose between a set of pre-defined styles.",
      )}
      cancelText={t("Close")}
      size="xl"
    >
      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("Custom Style")}
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <GalleryThumbnails className="h-4 w-4" />
            {t("Style Library")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-5">
          <FileDropZone
            title={t("Open Local Style")}
            subtitle={t("Select a JSON style file from your computer")}
            accept=".json"
            onFilesUploaded={(files) => {
              if (files.length == 0) return;
              onOpenStyleFile(files[0]);
            }}
          />
          <FieldURL
            title={t("Load from URL")}
            subtitle={t("Enter a URL to load a style from the web")}
            placeHolder="https://example.com/style.json"
            buttonText={t("Load Style")}
            onClick={(value) => onOpenStyleURL(value)}
          />
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="flex flex-col gap-5 items-center w-full">
            <SectionTitle
              title={t("Style Gallery")}
              subtitle={t("Choose from pre-made styles to get started")}
            />
            <ScrollArea>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                style={{ maxHeight: "22vh" }}
              >
                {publicStyles.map((style) => (
                  <PreviewCard
                    key={style.id}
                    title={style.title}
                    imageURL={style.thumbnail}
                    onClick={() => onOpenStyleURL(style.url)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  );
};

export default ModalOpen;
