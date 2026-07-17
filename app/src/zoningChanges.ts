export interface ZoningChangeRow {
	label: string;
	before: string;
	after: string;
}

export interface ZoningChange {
	rows: ZoningChangeRow[];
	note?: string;
}

const SIX_UNIT_NOTE =
	'The report also sketches conditional six-unit pathways near transit or corridors, on certain larger lots, or with affordable units. Its tables are not fully consistent, and this map does not determine parcel eligibility.';

const UNCHANGED_NOTE =
	'No district-specific remap is recommended. Villagewide parking, ADU, design-review, and terminology recommendations may still apply.';

const unchanged = (zone: string): ZoningChange => ({
	rows: [{ label: 'District remap', before: zone, after: 'Unchanged' }],
	note: UNCHANGED_NOTE,
});

export const ZONING_CHANGES: Record<string, ZoningChange> = {
	'R-1': {
		rows: [
			{
				label: 'Principal homes',
				before: '1 detached',
				after: 'Up to 4 units broadly',
			},
			{
				label: 'Minimum lot area',
				before: '10,000 sq ft',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '50 ft', after: '50 ft' },
			{ label: 'Maximum height', before: '30 ft', after: '35 ft / 3 stories' },
			{ label: 'Impervious coverage', before: '50%', after: '50%' },
			{
				label: 'Front / rear setback',
				before: '30 / 35 ft',
				after: '30 / 35 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-2': {
		rows: [
			{
				label: 'Principal homes',
				before: '1 detached',
				after: 'Up to 4 units broadly',
			},
			{
				label: 'Minimum lot area',
				before: '6,200 sq ft',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '50 ft', after: '30 ft' },
			{ label: 'Maximum height', before: '30 ft', after: '35 ft / 3 stories' },
			{ label: 'Impervious coverage', before: '50%', after: '60%' },
			{
				label: 'Front / rear setback',
				before: '30 / 35 ft',
				after: '20 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-3-50': {
		rows: [
			{
				label: 'Principal homes',
				before: '1 detached',
				after: 'Up to 4 units broadly',
			},
			{
				label: 'Minimum lot area',
				before: '5,000 sq ft',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '40 ft', after: '30 ft' },
			{ label: 'Maximum height', before: '30 ft', after: '35 ft / 3 stories' },
			{ label: 'Impervious coverage', before: '50%', after: '60%' },
			{
				label: 'Front / rear setback',
				before: '20 / 30 ft',
				after: '20 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-3-35': {
		rows: [
			{
				label: 'Principal homes',
				before: '1 detached',
				after: 'Up to 4 units broadly',
			},
			{
				label: 'Minimum lot area',
				before: '3,500 sq ft',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '35 ft', after: '30 ft' },
			{ label: 'Maximum height', before: '30 ft', after: '35 ft / 3 stories' },
			{ label: 'Impervious coverage', before: '60%', after: '60%' },
			{
				label: 'Front / rear setback',
				before: '20 / 30 ft',
				after: '20 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-4': {
		rows: [
			{
				label: 'Principal homes',
				before: '1 detached',
				after: 'Up to 4 units broadly',
			},
			{
				label: 'Minimum lot area',
				before: '3,500 sq ft',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '30 ft', after: '30 ft' },
			{ label: 'Maximum height', before: '30 ft', after: '35 ft / 3 stories' },
			{ label: 'Impervious coverage', before: '60%', after: '60%' },
			{
				label: 'Front / rear setback',
				before: '20 / 25 ft',
				after: '20 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-5': {
		rows: [
			{
				label: 'Principal homes',
				before: '1 or 2 units',
				after: 'Up to 4 units broadly',
			},
			{
				label: 'Minimum lot area',
				before: '3,500 / 5,000 sq ft',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '35 / 50 ft', after: '30 ft' },
			{ label: 'Maximum height', before: '35 ft', after: '35 ft / 3 stories' },
			{ label: 'Impervious coverage', before: '65% / 70%', after: '60%' },
			{
				label: 'Front / rear setback',
				before: '20 / 25 ft',
				after: '20 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-6': {
		rows: [
			{
				label: 'Housing',
				before: 'Multifamily; lot-area density limits',
				after: 'Broader range; no district-table unit cap',
			},
			{
				label: 'Minimum lot area',
				before: 'Varies by housing type',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '35–60 ft', after: '50 ft' },
			{ label: 'Maximum height', before: '35 ft', after: '55 ft / 5 stories' },
			{ label: 'Impervious coverage', before: '65–75%', after: '80%' },
			{
				label: 'Front / rear setback',
				before: '20 / 25 ft',
				after: '15 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	'R-7': {
		rows: [
			{
				label: 'Housing',
				before: 'Multifamily; lot-area density limits',
				after: 'Broader range; no district-table unit cap',
			},
			{
				label: 'Minimum lot area',
				before: 'Varies by housing type',
				after: 'None proposed',
			},
			{ label: 'Minimum lot width', before: '35 / 50 ft', after: '50 ft' },
			{ label: 'Maximum height', before: '45 ft', after: '55 ft / 5 stories' },
			{ label: 'Impervious coverage', before: '65–80%', after: '80%' },
			{
				label: 'Front / rear setback',
				before: '15 / 25 ft',
				after: '15 / 25 ft',
			},
		],
		note: SIX_UNIT_NOTE,
	},
	HS: {
		rows: [
			{ label: 'District', before: 'HS', after: 'M-1' },
			{ label: 'Maximum height', before: '45 ft', after: '48 ft / 4 stories' },
			{
				label: 'Near N-1 / N-2',
				before: 'Current HS rules',
				after: '35 ft / 3 stories',
			},
		],
		note: 'M-1 is recommended as the lower-scale, pedestrian-oriented mixed-use district. Residential lot-area-per-unit limits would be removed.',
	},
	NC: {
		rows: [
			{ label: 'District', before: 'NC', after: 'M-1' },
			{ label: 'Maximum height', before: '45 ft', after: '48 ft / 4 stories' },
			{
				label: 'Near N-1 / N-2',
				before: 'Current NC rules',
				after: '35 ft / 3 stories',
			},
		],
		note: 'M-1 is recommended as the lower-scale, pedestrian-oriented mixed-use district. Residential lot-area-per-unit limits would be removed.',
	},
	RR: {
		rows: [
			{ label: 'District', before: 'RR subdistrict system', after: 'M-2' },
			{
				label: 'Maximum height',
				before: '30–70 ft by subdistrict',
				after: '60 ft / 5 stories',
			},
			{
				label: 'Residential density',
				before: 'Subdistrict-specific limits',
				after: 'Lot-area-per-unit limits removed',
			},
		],
		note: 'The parcel data identifies RR but not its current RR subdistrict, so this map cannot say whether the height limit rises or falls on this particular parcel.',
	},
	GC: {
		rows: [
			{ label: 'District', before: 'GC', after: 'M-3' },
			{ label: 'Maximum height', before: '45 ft', after: '70 ft / 6 stories' },
			{
				label: 'Near N-1 / N-2',
				before: 'Current GC rules',
				after: '48 ft / 4 stories',
			},
		],
		note: 'M-3 is the highest-intensity proposed mixed-use district. Residential lot-area-per-unit limits would be removed.',
	},
	MS: {
		rows: [
			{ label: 'District', before: 'MS', after: 'M-3' },
			{
				label: 'Maximum height',
				before: 'Up to 50 ft for mixed / multifamily',
				after: '70 ft / 6 stories',
			},
			{
				label: 'Near N-1 / N-2',
				before: 'Current MS rules',
				after: '48 ft / 4 stories',
			},
		],
		note: 'M-3 is the highest-intensity proposed mixed-use district. Residential lot-area-per-unit limits would be removed.',
	},
	NA: {
		rows: [
			{ label: 'District', before: 'NA', after: 'M-3' },
			{ label: 'Maximum height', before: '45 ft', after: '70 ft / 6 stories' },
			{
				label: 'Near N-1 / N-2',
				before: 'Current NA rules',
				after: '48 ft / 4 stories',
			},
		],
		note: 'M-3 is the highest-intensity proposed mixed-use district. Residential lot-area-per-unit limits would be removed.',
	},
	'DT-1': unchanged('DT-1'),
	'DT-2': unchanged('DT-2'),
	'DT-3': unchanged('DT-3'),
	H: unchanged('H'),
	I: unchanged('I'),
	OS: unchanged('OS'),
	'P-R': unchanged('P-R'),
};

export function changesFor(existingZone: string): ZoningChange {
	return (
		ZONING_CHANGES[existingZone] ?? {
			rows: [
				{ label: 'District', before: existingZone, after: 'See proposal' },
			],
			note: 'No district-specific comparison is available for this source district.',
		}
	);
}
