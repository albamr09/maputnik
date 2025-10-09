interface TitleProps {
	title: string;
	subtitle?: string;
}

const Title: React.FC<TitleProps> = ({ title, subtitle }) => {
	return (
		<div className="flex flex-col flex-1 gap-1 w-full">
			<h3 className="text-base font-semibold">{title}</h3>
			{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
		</div>
	);
};

export default Title;
