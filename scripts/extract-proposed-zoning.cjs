#!/usr/bin/env node
/**
 * Build the proposed-zoning parcel layer deterministically:
 *
 * Village existing zoning ── greatest parcel-area overlap ── parcels
 * Opticos Article 3 crosswalk ────────────────────────────────┘
 */
const fs = require('node:fs');
const path = require('node:path');
const {
	CROSSWALK,
	DISTRICT_NAMES,
	assignParcel,
	centerOfGeometry,
	prepareZones,
	roundGeometry,
} = require('./zoning-data.cjs');

const ZONING_URL =
	'https://services2.arcgis.com/uRp89l90TnovtJpf/arcgis/rest/services/VOP_GISC_PUBLISH_CMV_FGDB_202204_View/FeatureServer/34/query' +
	'?where=1%3D1&outFields=ZONED,ZONINGCATEGORY&outSR=4326&returnGeometry=true&f=geojson';
const DEFAULT_PARCELS = path.resolve(
	__dirname,
	'../../oak-park-properties/app/public/parcels.geojson',
);
const PUBLIC_DIR = path.resolve(__dirname, '../app/public');
const DATA_DIR = path.resolve(__dirname, '../data');
const DEFAULT_ZONING = path.join(DATA_DIR, 'village_existing_zoning.geojson');

function option(name, fallback) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? path.resolve(process.argv[index + 1]) : fallback;
}

async function main() {
	const parcelsPath = option('--parcels', DEFAULT_PARCELS);
	const zoningPath = option('--zoning', DEFAULT_ZONING);
	const refreshZoning = process.argv.includes('--refresh-zoning');
	if (!fs.existsSync(parcelsPath)) {
		throw new Error(`Parcel source not found: ${parcelsPath}\nPass a path with --parcels.`);
	}

	fs.mkdirSync(DATA_DIR, { recursive: true });
	let zoning;
	if (refreshZoning || !fs.existsSync(zoningPath)) {
		console.log('▸ fetching Village existing zoning…');
		const response = await fetch(ZONING_URL);
		if (!response.ok) throw new Error(`Village zoning request failed: ${response.status} ${response.statusText}`);
		zoning = await response.json();
		fs.writeFileSync(zoningPath, JSON.stringify(zoning));
	} else {
		console.log('▸ reading saved Village zoning snapshot…');
		zoning = JSON.parse(fs.readFileSync(zoningPath, 'utf8'));
	}
	if (!Array.isArray(zoning.features) || !zoning.features.length) {
		throw new Error('Village zoning response contained no features');
	}
	const zones = prepareZones(zoning.features);
	const crosswalkedZoning = structuredClone(zoning);
	for (const feature of crosswalkedZoning.features) {
		const proposed = CROSSWALK[feature.properties.ZONED];
		feature.properties.proposed_zone = proposed;
		feature.properties.proposed_name = DISTRICT_NAMES[proposed];
	}

	console.log('▸ assigning each parcel by greatest zoning-area overlap…');
	const parcels = JSON.parse(fs.readFileSync(parcelsPath, 'utf8'));
	const summary = {};
	const searchIndex = [];
	const boundaryParcels = [];
	const lowCoverageParcels = [];
	const unmatched = [];

	for (const feature of parcels.features) {
		const assignment = assignParcel(feature.geometry, zones);
		if (!assignment) {
			unmatched.push(feature.properties.pin);
			continue;
		}
		if (assignment.secondCoverage >= 0.001) {
			boundaryParcels.push({
				pin: feature.properties.pin,
				assigned: assignment.existingZone,
				coverage: Number(assignment.coverage.toFixed(6)),
				zones: assignment.overlaps.map(({ code }) => code),
			});
		}
		if (assignment.totalCoverage < 0.99) {
			lowCoverageParcels.push({
				pin: feature.properties.pin,
				assigned: assignment.existingZone,
				total_coverage: Number(assignment.totalCoverage.toFixed(6)),
			});
		}

		feature.properties = {
			pin: feature.properties.pin,
			address: feature.properties.address ?? '',
			class: feature.properties.class ?? '',
			description: feature.properties.description ?? '',
			existing_zone: assignment.existingZone,
			proposed_zone: assignment.proposedZone,
		};
		searchIndex.push([
			feature.properties.pin,
			feature.properties.address,
			feature.properties.proposed_zone,
			...centerOfGeometry(feature.geometry),
		]);
		roundGeometry(feature.geometry);
		summary[assignment.proposedZone] = (summary[assignment.proposedZone] ?? 0) + 1;
	}

	if (unmatched.length) {
		throw new Error(`${unmatched.length} parcels have no zoning overlap: ${unmatched.join(', ')}`);
	}

	fs.mkdirSync(PUBLIC_DIR, { recursive: true });
	fs.writeFileSync(
		path.join(DATA_DIR, 'existing_zoning_crosswalked.geojson'),
		JSON.stringify(crosswalkedZoning),
	);
	fs.writeFileSync(
		path.join(PUBLIC_DIR, 'parcels_proposed_zoning.geojson'),
		JSON.stringify(parcels),
	);
	fs.writeFileSync(
		path.join(PUBLIC_DIR, 'parcel_search.json'),
		JSON.stringify(searchIndex),
	);
	fs.writeFileSync(
		path.join(PUBLIC_DIR, 'zoning_summary.json'),
		JSON.stringify(
			{
				summary,
				total: parcels.features.length,
				unmatched: 0,
				boundary_parcels: boundaryParcels,
				low_coverage_parcels: lowCoverageParcels,
			},
			null,
			2,
		),
	);

	console.log(
		`✓ ${parcels.features.length} parcels; 0 unmatched; ${boundaryParcels.length} meaningful boundary overlaps; ${lowCoverageParcels.length} low-coverage warnings`,
	);
	console.log(summary);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
