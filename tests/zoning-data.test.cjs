const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
	CROSSWALK,
	assignParcel,
	prepareZones,
} = require('../scripts/zoning-data.cjs');

test('greatest overlap wins and a P-R tie has explicit precedence', () => {
	const square = (west, east) => ({
		type: 'Polygon',
		coordinates: [[[west, 0], [east, 0], [east, 1], [west, 1], [west, 0]]],
	});
	const zones = prepareZones([
		{ type: 'Feature', properties: { ZONED: 'R-2' }, geometry: square(0, 0.6) },
		{ type: 'Feature', properties: { ZONED: 'R-7' }, geometry: square(0.6, 1) },
	]);
	assert.equal(assignParcel(square(0, 1), zones).existingZone, 'R-2');

	const tied = prepareZones([
		{ type: 'Feature', properties: { ZONED: 'R-7' }, geometry: square(0, 1) },
		{ type: 'Feature', properties: { ZONED: 'P-R' }, geometry: square(0, 1) },
	]);
	assert.equal(assignParcel(square(0, 1), tied).existingZone, 'P-R');
});

test('checked-in parcel data is complete and matches its summary', () => {
	assert.ok(
		fs.statSync('app/public/parcels_proposed_zoning.geojson').size < 8_000_000,
		'parcel browser payload should stay below 8 MB',
	);
	const parcels = JSON.parse(fs.readFileSync('app/public/parcels_proposed_zoning.geojson'));
	const report = JSON.parse(fs.readFileSync('app/public/zoning_summary.json'));
	const search = JSON.parse(fs.readFileSync('app/public/parcel_search.json'));
	const counts = {};
	const expectedProperties = [
		'address',
		'class',
		'description',
		'existing_zone',
		'pin',
		'proposed_zone',
	];

	for (const feature of parcels.features) {
		assert.deepEqual(Object.keys(feature.properties).sort(), expectedProperties);
		assert.ok(feature.properties.pin);
		assert.ok(CROSSWALK[feature.properties.existing_zone]);
		assert.equal(
			feature.properties.proposed_zone,
			CROSSWALK[feature.properties.existing_zone],
		);
		counts[feature.properties.proposed_zone] =
			(counts[feature.properties.proposed_zone] ?? 0) + 1;
	}

	assert.equal(parcels.features.length, 17_523);
	assert.equal(search.length, parcels.features.length);
	assert.ok(fs.statSync('app/public/parcel_search.json').size < 1_200_000);
	assert.deepEqual(search[0].slice(0, 3), [
		parcels.features[0].properties.pin,
		parcels.features[0].properties.address,
		parcels.features[0].properties.proposed_zone,
	]);
	assert.equal(search[0].length, 5);
	assert.equal(report.total, parcels.features.length);
	assert.equal(report.unmatched, 0);
	assert.deepEqual(counts, report.summary);
	assert.ok(Array.isArray(report.boundary_parcels));
	assert.ok(Array.isArray(report.low_coverage_parcels));
});
