interface SectionTitleProps {
	title: string;
	subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => {
	return (
		<div className="flex flex-col flex-1 gap-1 w-full">
			<h3 className="text-base font-semibold">{title}</h3>
			{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
		</div>
	);
};

export default SectionTitle;
