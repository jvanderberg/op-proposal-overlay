import type { ZoneCode } from './types';

export interface DistrictMeta {
	code: ZoneCode;
	name: string;
	family: string;
	/** fill color, taken from Opticos's "Zoning for Tomorrow" map */
	color: string;
	/** existing districts that map into this one */
	from: string;
	detail: string;
}

export const DISTRICTS: Record<ZoneCode, DistrictMeta> = {
	'DT-1': {
		code: 'DT-1',
		name: 'Downtown Central Sub-District',
		family: 'Downtown',
		color: '#1c4a65',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
	'DT-2': {
		code: 'DT-2',
		name: 'Hemingway Sub-District',
		family: 'Downtown',
		color: '#65b6cb',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
	'DT-3': {
		code: 'DT-3',
		name: 'Pleasant Sub-District',
		family: 'Downtown',
		color: '#c0e5e5',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
	'M-1': {
		code: 'M-1',
		name: 'Mixed-Use 1',
		family: 'Mixed-Use',
		color: '#ed7674',
		from: 'HS, NC',
		detail:
			'Small-scale, pedestrian-oriented commercial for neighborhood nodes and corridors — lower scale and intensity than M-2 and M-3.',
	},
	'M-2': {
		code: 'M-2',
		name: 'Mixed-Use 2',
		family: 'Mixed-Use',
		color: '#ed1e32',
		from: 'RR (Roosevelt Rd)',
		detail:
			'Mixed-use and commercial along the larger commercial corridors; greater scale and intensity than M-1.',
	},
	'M-3': {
		code: 'M-3',
		name: 'Mixed-Use 3',
		family: 'Mixed-Use',
		color: '#c02026',
		from: 'GC, MS (Madison), NA (North Ave)',
		detail:
			'Highest-intensity mixed-use and commercial corridors — the broadest range of uses, including higher-density residential.',
	},
	'N-1': {
		code: 'N-1',
		name: 'Neighborhood 1',
		family: 'Neighborhood',
		color: '#ffe600',
		from: 'R-1',
		detail:
			'Historic / architecturally significant areas: medium–large homes on larger lots. Min lot width 50 ft · max 35 ft & 3 stories · up to 4 units/lot.',
	},
	'N-2': {
		code: 'N-2',
		name: 'Neighborhood 2',
		family: 'Neighborhood',
		color: '#febe14',
		from: 'R-2, R-3-50, R-3-35, R-4, R-5',
		detail:
			'A range of neighborhood-scale housing types on moderate lots — the "missing middle" core. Min lot width 30 ft · max 35 ft & 3 stories · up to 4 units broadly, with conditional six-unit pathways.',
	},
	'N-3': {
		code: 'N-3',
		name: 'Neighborhood 3',
		family: 'Neighborhood',
		color: '#f57e20',
		from: 'R-6, R-7',
		detail:
			'Greater-intensity residential: medium–large footprints, moderate-to-high density. Min lot width 50 ft · max 55 ft & 5 stories.',
	},
	H: {
		code: 'H',
		name: 'Hospital',
		family: 'Special (unchanged)',
		color: '#d2d2d2',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
	I: {
		code: 'I',
		name: 'Institutional',
		family: 'Special (unchanged)',
		color: '#d2d2d2',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
	OS: {
		code: 'OS',
		name: 'Open Space',
		family: 'Special (unchanged)',
		color: '#c8dcc8',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
	'P-R': {
		code: 'P-R',
		name: 'Public Right-of-Way',
		family: 'Special (unchanged)',
		color: '#ebebeb',
		from: 'unchanged',
		detail:
			'No district-specific remap is recommended; villagewide recommendations may still apply.',
	},
};

export const ZONE_ORDER: ZoneCode[] = [
	'DT-1',
	'DT-2',
	'DT-3',
	'M-1',
	'M-2',
	'M-3',
	'N-1',
	'N-2',
	'N-3',
	'H',
	'I',
	'OS',
	'P-R',
];

export const FAMILIES = [
	'Downtown',
	'Mixed-Use',
	'Neighborhood',
	'Special (unchanged)',
];

export const CARTO_LIGHT = ['a', 'b', 'c', 'd'].map(
	(subdomain) =>
		`https://${subdomain}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`,
);
export const CARTO_DARK = ['a', 'b', 'c', 'd'].map(
	(subdomain) =>
		`https://${subdomain}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`,
);

/** geographic bounds of the georeferenced Opticos map crops (WGS84 SW, NE) */
export const OVERLAY_BOUNDS: [[number, number], [number, number]] = [
	[41.864967, -87.806035],
	[41.909314, -87.774295],
];

export const UNDERLAYS = [
	{ value: '', label: 'None' },
	{ value: 'proposed_web.png', label: 'Opticos proposed map' },
	{ value: 'placetypes_web.png', label: 'Place Types map' },
];
