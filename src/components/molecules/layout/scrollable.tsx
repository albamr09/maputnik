import { ScrollArea } from "@/components/atoms/scroll-area";

interface ScrollableProps {
	children: React.ReactNode;
	maxHeight: React.CSSProperties["maxHeight"];
}

const Scrollable: React.FC<ScrollableProps> = ({ children, maxHeight }) => {
	return (
		<ScrollArea>
			<div style={{ maxHeight }}>{children}</div>
		</ScrollArea>
	);
};

export default Scrollable;
