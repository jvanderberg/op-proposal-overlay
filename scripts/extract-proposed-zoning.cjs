#!/usr/bin/env node
/**
 * Build the proposed-zoning parcel layer.
 *
 *   Village existing zoning (ArcGIS FeatureServer)  ── crosswalk ─┐
 *   Cook County parcels (via oak-park-properties)  ── point-in-polygon join
 *                                                                 ▼
 *                                    app/public/parcels_proposed_zoning.geojson
 *
 * The crosswalk is Opticos's Article 3 district consolidation — a deterministic
 * rename/merge of existing districts, not a color read of any map.
 */
const fs = require('node:fs');
const path = require('node:path');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point } = require('@turf/helpers');

const ZONING_URL =
	'https://services2.arcgis.com/uRp89l90TnovtJpf/arcgis/rest/services/VOP_GISC_PUBLISH_CMV_FGDB_202204_View/FeatureServer/34/query' +
	'?where=1%3D1&outFields=ZONED,ZONINGCATEGORY&outSR=4326&returnGeometry=true&f=geojson';
const PARCELS = path.resolve(
	__dirname,
	'../../oak-park-properties/app/public/parcels.geojson',
);
const OUT_DIR = path.resolve(__dirname, '../app/public');

// Opticos Article 3 crosswalk (existing -> proposed)
const CROSS = {
	'R-1': 'N-1',
	'R-2': 'N-2', 'R-3-50': 'N-2', 'R-3-35': 'N-2', 'R-4': 'N-2', 'R-5': 'N-2',
	'R-6': 'N-3', 'R-7': 'N-3',
	'DT-1': 'DT-1', 'DT-2': 'DT-2', 'DT-3': 'DT-3',
	HS: 'M-1', NC: 'M-1',
	RR: 'M-2',
	GC: 'M-3', MS: 'M-3', NA: 'M-3',
	H: 'H', I: 'I', OS: 'OS', 'P-R': 'P-R',
};
const NAMES = {
	'DT-1': 'Downtown Central Sub-District', 'DT-2': 'Hemingway Sub-District',
	'DT-3': 'Pleasant Sub-District', 'M-1': 'Mixed-Use 1', 'M-2': 'Mixed-Use 2', 'M-3': 'Mixed-Use 3',
	'N-1': 'Neighborhood 1', 'N-2': 'Neighborhood 2', 'N-3': 'Neighborhood 3',
	H: 'Hospital (unchanged)', I: 'Institutional (unchanged)', OS: 'Open Space (unchanged)',
	'P-R': 'Public Right-of-Way (unchanged)',
};

function centroid(geom) {
	const ring = geom.type === 'MultiPolygon' ? geom.coordinates[0][0] : geom.coordinates[0];
	let x = 0;
	let y = 0;
	for (const [lng, lat] of ring) {
		x += lng;
		y += lat;
	}
	return point([x / ring.length, y / ring.length]);
}

async function main() {
	console.log('▸ fetching existing zoning…');
	const zoning = await (await fetch(ZONING_URL)).json();
	for (const f of zoning.features) {
		const p = CROSS[f.properties.ZONED] ?? f.properties.ZONED;
		f.properties.proposed_zone = p;
		f.properties.proposed_name = NAMES[p] ?? '';
	}
	fs.writeFileSync(
		path.join(OUT_DIR, 'existing_zoning_crosswalked.geojson'),
		JSON.stringify(zoning),
	);

	console.log('▸ joining parcels…');
	const parcels = JSON.parse(fs.readFileSync(PARCELS, 'utf8'));
	const summary = {};
	let miss = 0;
	for (const f of parcels.features) {
		const c = centroid(f.geometry);
		let ez = null;
		for (const zf of zoning.features) {
			if (booleanPointInPolygon(c, zf.geometry)) {
				ez = zf.properties.ZONED;
				break;
			}
		}
		if (!ez) {
			miss++;
			ez = 'R-2'; // fallback: treat unmatched as the dominant residential district
		}
		const proposed = CROSS[ez] ?? ez;
		f.properties.existing_zone = ez;
		f.properties.proposed_zone = proposed;
		f.properties.proposed_name = NAMES[proposed] ?? '';
		summary[proposed] = (summary[proposed] ?? 0) + 1;
	}
	fs.writeFileSync(
		path.join(OUT_DIR, 'parcels_proposed_zoning.geojson'),
		JSON.stringify(parcels),
	);
	fs.writeFileSync(
		path.join(OUT_DIR, 'zoning_summary.json'),
		JSON.stringify({ summary, total: parcels.features.length, unmatched: miss }, null, 2),
	);
	console.log(`✓ ${parcels.features.length} parcels (${miss} unmatched → fallback)`);
	console.log(summary);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
