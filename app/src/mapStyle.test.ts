import { describe, expect, it } from 'vitest';
import { baseStyle, selectedFilter, zoneFilter } from './mapStyle';

describe('MapLibre style helpers', () => {
	it('builds a raster street basemap', () => {
		const style = baseStyle(false);
		expect(style.sources.carto).toMatchObject({
			type: 'raster',
			tileSize: 256,
		});
		expect(style.layers[0]).toMatchObject({ type: 'raster', source: 'carto' });
	});

	it('filters parcels by active zone and selected PIN', () => {
		expect(zoneFilter(new Set(['N-1', 'M-2']))).toEqual([
			'in',
			['get', 'proposed_zone'],
			['literal', ['M-2', 'N-1']],
		]);
		expect(selectedFilter('123')).toEqual(['==', ['get', 'pin'], '123']);
	});
});
