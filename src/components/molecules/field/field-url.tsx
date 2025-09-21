import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import SectionTitle from "@/components/atoms/section-title";
import { useRef } from "react";

interface FieldURLProps {
  title: string;
  buttonText: string;
  subtitle?: string;
  placeHolder?: string;
  onClick?: (value: string | undefined) => void;
}

const FieldURL: React.FC<FieldURLProps> = ({
  title,
  subtitle,
  buttonText,
  placeHolder,
  onClick = () => {},
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-5 items-center w-full">
      <SectionTitle title={title} subtitle={subtitle} />
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex gap-2 w-full items-center"
      >
        <Input ref={inputRef} placeholder={placeHolder} type="url" />
        <Button onClick={() => onClick(inputRef.current?.value)} type="submit">
          {buttonText}
        </Button>
      </form>
    </div>
  );
};

export default FieldURL;
