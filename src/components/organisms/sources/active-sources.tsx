import { useAppSelector } from "@/store/hooks";
import { selectStyleSources } from "@/store/slices/styleSlice";
import { SourceSpecification } from "maplibre-gl";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import SectionTitle from "@/components/atoms/section-title";
import { Button } from "@/components/atoms/button";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { useCallback, useState } from "react";
import SourceEditor from "@/components/organisms/sources/editor";
import useSourceEdition from "@/hooks/edition/useSourceEdition";
interface ActiveSourceProps {
  id: string;
  source: SourceSpecification;
}

const ActiveSource: React.FC<ActiveSourceProps> = ({ id, source }) => {
  const [isEditing, setIsEditing] = useState(false);

  const { t } = useTranslation();
  const { deleteSource } = useSourceEdition();

  const toggleEdition = useCallback(() => {
    setIsEditing((p) => !p);
  }, []);

  return (
    <Card key={id}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base"># {id}</CardTitle>
            <Badge variant="secondary">{source.type}</Badge>
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => toggleEdition()}
              title={isEditing ? t("Leave changes") : t("Edit source")}
            >
              {isEditing ? <Check /> : <Pencil />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteSource(id)}
              title="Remove source"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isEditing && (
        <CardContent>
          <SourceEditor id={id} source={source} />
        </CardContent>
      )}
    </Card>
  );
};

const ActiveSources = () => {
  const mapStyleSources = useAppSelector(selectStyleSources);
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title={t("Active Sources")} />
      {Object.entries(mapStyleSources).map(([id, source]) => (
        <ActiveSource key={id} id={id} source={source} />
      ))}
    </div>
  );
};

export default ActiveSources;
