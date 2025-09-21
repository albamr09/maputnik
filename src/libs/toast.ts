import { toast } from "sonner";

export const showError = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  toast.error(title, {
    description,
  });
};

export const showSuccess = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  toast.success(title, {
    description,
  });
};
