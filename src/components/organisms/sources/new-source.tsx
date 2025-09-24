import { useTranslation } from "react-i18next";
import SectionTitle from "@/components/atoms/section-title";
const NewSource = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title={t("Add New Source")} />
    </div>
  );
};

export default NewSource;
