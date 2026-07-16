import type {
	Feature,
	FeatureCollection,
	MultiPolygon,
	Polygon,
} from 'geojson';

export type ZoneCode =
	| 'DT-1'
	| 'DT-2'
	| 'DT-3'
	| 'M-1'
	| 'M-2'
	| 'M-3'
	| 'N-1'
	| 'N-2'
	| 'N-3'
	| 'H'
	| 'I'
	| 'OS'
	| 'P-R';

export interface ParcelProps {
	pin: string;
	address: string;
	class: string;
	description?: string;
	url?: string;
	existing_zone: string;
	proposed_zone: ZoneCode;
	proposed_name: string;
}

export type ParcelGeometry = Polygon | MultiPolygon;
export type ParcelFeature = Feature<ParcelGeometry, ParcelProps>;
export type ParcelCollection = FeatureCollection<ParcelGeometry, ParcelProps>;
