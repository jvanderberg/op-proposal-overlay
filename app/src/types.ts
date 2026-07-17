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
	existing_zone: string;
	proposed_zone: ZoneCode;
}

export interface SearchEntry {
	pin: string;
	address: string;
	zone: ZoneCode;
	/** [longitude, latitude] center of the parcel bounds */
	center: [number, number];
}

export type SearchTuple = [
	pin: string,
	address: string,
	zone: ZoneCode,
	longitude: number,
	latitude: number,
];

export interface ZoningSummary {
	summary: Record<ZoneCode, number>;
	total: number;
	unmatched: number;
}
