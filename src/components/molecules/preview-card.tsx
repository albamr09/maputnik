import { Card, CardContent } from "@/components/atoms/card";

interface PreviewCardProps {
  title: string;
  imageURL: string;
  onClick?: () => void;
}

const PreviewCard: React.FC<PreviewCardProps> = ({
  title,
  imageURL,
  onClick = () => {},
}) => {
  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video rounded-t-lg overflow-hidden">
        <img
          src={imageURL}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm">{title}</h4>
      </CardContent>
    </Card>
  );
};

export default PreviewCard;
