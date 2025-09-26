import classnames from "classnames";
import React from "react";
import { IconContext } from "react-icons";
import {
	MdContentCopy,
	MdDelete,
	MdOutlineFilterAlt,
	MdOutlineFilterAltOff,
	MdVisibility,
	MdVisibilityOff,
} from "react-icons/md";
import { SortableElement, SortableHandle } from "react-sortable-hoc";
import IconLayer from "./IconLayer";

type DraggableLabelProps = {
	layerId: string;
	layerType: string;
};

const DraggableLabel = SortableHandle((props: DraggableLabelProps) => {
	return (
		<div className="maputnik-layer-list-item-handle">
			<IconLayer className="layer-handle__icon" type={props.layerType} />
			<button className="maputnik-layer-list-item-id">{props.layerId}</button>
		</div>
	);
});

type IconActionProps = {
	action: string;
	onClick(...args: unknown[]): unknown;
	wdKey?: string;
	classBlockName?: string;
	classBlockModifier?: string;
};

class IconAction extends React.Component<IconActionProps> {
	renderIcon() {
		switch (this.props.action) {
			case "floor-filter-remove":
				return <MdOutlineFilterAlt />;
			case "floor-filter-add":
				return <MdOutlineFilterAltOff />;
			case "duplicate":
				return <MdContentCopy />;
			case "show":
				return <MdVisibility />;
			case "hide":
				return <MdVisibilityOff />;
			case "delete":
				return <MdDelete />;
		}
	}

	render() {
		const { classBlockName, classBlockModifier } = this.props;

		let classAdditions = "";
		if (classBlockName) {
			classAdditions = `maputnik-layer-list-icon-action__${classBlockName}`;

			if (classBlockModifier) {
				classAdditions += ` maputnik-layer-list-icon-action__${classBlockName}--${classBlockModifier}`;
			}
		}

		return (
			<button
				tabIndex={-1}
				title={this.props.action}
				className={`maputnik-layer-list-icon-action ${classAdditions}`}
				data-wd-key={this.props.wdKey}
				onClick={this.props.onClick}
				aria-hidden="true"
			>
				{this.renderIcon()}
			</button>
		);
	}
}

type LayerListItemProps = {
	id?: string;
	layerIndex: number;
	layerId: string;
	layerType: string;
	isSelected?: boolean;
	visibility?: string;
	floorFilterApplied?: boolean;
	className?: string;
	onLayerSelect(...args: unknown[]): unknown;
	onLayerCopy?(...args: unknown[]): unknown;
	onLayerDestroy?(...args: unknown[]): unknown;
	onLayerVisibilityToggle?(...args: unknown[]): unknown;
	onLayerFloorFilterToggle?(...args: unknown[]): unknown;
};

class LayerListItem extends React.Component<LayerListItemProps> {
	static defaultProps = {
		isSelected: false,
		visibility: "visible",
		floorFilterApplied: false,
		onLayerCopy: () => {},
		onLayerDestroy: () => {},
		onLayerVisibilityToggle: () => {},
		onLayerFloorFilterToggle: () => {},
	};

	render() {
		const visibilityAction =
			this.props.visibility === "visible" ? "show" : "hide";
		const floorFilterAction = this.props.floorFilterApplied
			? "floor-filter-remove"
			: "floor-filter-add";

		return (
			<IconContext.Provider value={{ size: "14px" }}>
				<li
					id={this.props.id}
					key={this.props.layerId}
					onClick={(_e) => this.props.onLayerSelect(this.props.layerIndex)}
					data-wd-key={"layer-list-item:" + this.props.layerId}
					className={classnames({
						"maputnik-layer-list-item": true,
						"maputnik-layer-list-item-selected": this.props.isSelected,
						[this.props.className!]: true,
					})}
				>
					<DraggableLabel {...this.props} />
					<span style={{ flexGrow: 1 }} />
					<IconAction
						wdKey={"layer-list-item:" + this.props.layerId + ":delete"}
						action={"delete"}
						classBlockName="delete"
						onClick={(_e) => this.props.onLayerDestroy!(this.props.layerIndex)}
					/>
					<IconAction
						wdKey={"layer-list-item:" + this.props.layerId + ":copy"}
						action={"duplicate"}
						classBlockName="duplicate"
						onClick={(_e) => this.props.onLayerCopy!(this.props.layerIndex)}
					/>
					<IconAction
						wdKey={"layer-list-item:" + this.props.layerId + ":floor-filter"}
						action={floorFilterAction}
						classBlockName="floor-filter"
						onClick={(_e) => {
							this.props.onLayerFloorFilterToggle!(this.props.layerIndex);
						}}
					/>
					<IconAction
						wdKey={
							"layer-list-item:" + this.props.layerId + ":toggle-visibility"
						}
						action={visibilityAction}
						classBlockName="visibility"
						classBlockModifier={visibilityAction}
						onClick={(_e) =>
							this.props.onLayerVisibilityToggle!(this.props.layerIndex)
						}
					/>
				</li>
			</IconContext.Provider>
		);
	}
}

const LayerListItemSortable = SortableElement<LayerListItemProps>(
	(props: LayerListItemProps) => <LayerListItem {...props} />,
);

export default LayerListItemSortable;
