import type {
	ExpressionSpecification,
	FilterSpecification,
	StyleSpecification,
} from 'maplibre-gl';
import { CARTO_DARK, CARTO_LIGHT, DISTRICTS, ZONE_ORDER } from './constants';
import type { ZoneCode } from './types';

export const ZONE_COLOR_EXPRESSION = [
	'match',
	['get', 'proposed_zone'],
	...ZONE_ORDER.flatMap((zone) => [zone, DISTRICTS[zone].color]),
	'#888888',
] as unknown as ExpressionSpecification;

export function zoneFilter(activeZones: Set<ZoneCode>): FilterSpecification {
	return [
		'in',
		['get', 'proposed_zone'],
		['literal', ZONE_ORDER.filter((zone) => activeZones.has(zone))],
	] as FilterSpecification;
}

export function selectedFilter(pin: string | null): FilterSpecification {
	return ['==', ['get', 'pin'], pin ?? ''] as FilterSpecification;
}

export function baseStyle(isDark: boolean): StyleSpecification {
	return {
		version: 8,
		sources: {
			carto: {
				type: 'raster',
				tiles: isDark ? CARTO_DARK : CARTO_LIGHT,
				tileSize: 256,
				attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
			},
		},
		layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
	};
}
