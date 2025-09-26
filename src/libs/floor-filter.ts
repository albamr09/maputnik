import {
	ExpressionSpecification,
	LegacyFilterSpecification,
} from "maplibre-gl";
import { FILTER_OPS } from "../components/FilterEditor";

const isExpressionFloorCondition = (expresion: any) => {
	if (Array.isArray(expresion) && expresion.length >= 3) {
		return (
			Array.isArray(expresion[1]) &&
			expresion[1].length == 2 &&
			expresion[1][0] == "get" &&
			expresion[1][1] == "floor_id"
		);
	}
	return false;
};

// Helper function to check if filter contains floor condition
export const hasFloorFilter = (
	filter: LegacyFilterSpecification | ExpressionSpecification,
): boolean => {
	if (!Array.isArray(filter)) return false;

	return filter.some((item) => isExpressionFloorCondition(item));
};

// Helper function to add floor filter
export const addFloorFilter = (
	filter: LegacyFilterSpecification | ExpressionSpecification,
	selectedFloorId: number,
): LegacyFilterSpecification | ExpressionSpecification => {
	if (!Array.isArray(filter)) return filter;

	const floorCondition = ["==", ["get", "floor_id"], selectedFloorId];

	// If it's a simple filter like ["all"] or ["any"], add the floor condition
	if (filter.length === 1 && FILTER_OPS.includes(filter[0])) {
		return [filter[0], floorCondition] as
			| LegacyFilterSpecification
			| ExpressionSpecification;
	}

	// If it already has conditions, add the floor condition
	const newFilter = [...filter];
	newFilter.push(floorCondition);

	return newFilter as LegacyFilterSpecification | ExpressionSpecification;
};

// Helper function to remove floor filter from the filter array
export const removeFloorFilter = (
	filter: LegacyFilterSpecification | ExpressionSpecification,
): LegacyFilterSpecification | ExpressionSpecification => {
	if (!Array.isArray(filter)) return filter;

	const newFilter = filter.filter((item) => {
		if (isExpressionFloorCondition(item)) {
			return false;
		}
		return true;
	});

	return newFilter as LegacyFilterSpecification | ExpressionSpecification;
};
