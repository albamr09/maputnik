import { Button } from "@/components/atoms/button";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import publicStyles from "@/config/styles.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import {
  Upload,
  Link,
  FileText,
  GalleryThumbnails,
  AlertCircle,
} from "lucide-react";
import Modal from "@/components/molecules/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalsState } from "@/store/slices/uiCoreSlice";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/atoms/input";
import { Separator } from "@/components/atoms/separator";
import { ScrollArea } from "../atoms/scroll-area";

const ModalOpenRedesigned = () => {
  const dispatch = useAppDispatch();
  const modalsState = useAppSelector(selectModalsState);

  const { t } = useTranslation();

  return (
    <Modal
      isOpen={modalsState.import}
      onClose={() => dispatch(closeModal("import"))}
      title={t("Import Style")}
      description={t(
        "Load your JSON style locally or remotely. You can also choose between a set of pre-defined styles.",
      )}
      cancelText={t("Close")}
      size="xl"
      maxHeight="60vh"
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

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Open Local Style
              </CardTitle>
              <CardDescription>
                Select a JSON style file from your computer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                //onClick={onOpenFile}
                className="w-full h-12 text-base"
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Choose Style File
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: .json
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Load from URL
              </CardTitle>
              <CardDescription>
                Enter a URL to load a style from the web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                // onSubmit={onSubmitUrl}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/style.json"
                    //value={styleUrl}
                    //onChange={(e) => setStyleUrl(e.target.value)}
                    className="h-11"
                  />
                </div>

                {true && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>test</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    //disabled={!styleUrl.trim()}
                    className="flex-1"
                  >
                    Load Style
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    // onClick={clearError}
                  >
                    Clear
                  </Button>
                </div>
              </form>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Note:</p>
                <p>
                  The URL must have{" "}
                  <a
                    href="https://enable-cors.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    CORS enabled
                  </a>{" "}
                  to work properly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t("Style Gallery")}
              </CardTitle>
              <CardDescription>
                {t("Choose from pre-made styles to get started")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicStyles.map((style) => (
                    <Card
                      key={style.id}
                      className="group cursor-pointer hover:shadow-md transition-shadow"
                      //onClick={() => onStyleSelect(style.url)}
                    >
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img
                          src={style.thumbnail}
                          alt={style.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-1">
                          {style.title}
                        </h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Modal>
  );
};

export default ModalOpenRedesigned;
