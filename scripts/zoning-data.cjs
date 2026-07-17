const polygonClipping = require('polygon-clipping');

const CROSSWALK = Object.freeze({
	'R-1': 'N-1',
	'R-2': 'N-2',
	'R-3-50': 'N-2',
	'R-3-35': 'N-2',
	'R-4': 'N-2',
	'R-5': 'N-2',
	'R-6': 'N-3',
	'R-7': 'N-3',
	'DT-1': 'DT-1',
	'DT-2': 'DT-2',
	'DT-3': 'DT-3',
	HS: 'M-1',
	NC: 'M-1',
	RR: 'M-2',
	GC: 'M-3',
	MS: 'M-3',
	NA: 'M-3',
	H: 'H',
	I: 'I',
	OS: 'OS',
	'P-R': 'P-R',
});

const DISTRICT_NAMES = Object.freeze({
	'DT-1': 'Downtown Central Sub-District',
	'DT-2': 'Hemingway Sub-District',
	'DT-3': 'Pleasant Sub-District',
	'M-1': 'Mixed-Use 1',
	'M-2': 'Mixed-Use 2',
	'M-3': 'Mixed-Use 3',
	'N-1': 'Neighborhood 1',
	'N-2': 'Neighborhood 2',
	'N-3': 'Neighborhood 3',
	H: 'Hospital (unchanged)',
	I: 'Institutional (unchanged)',
	OS: 'Open Space (unchanged)',
	'P-R': 'Public Right-of-Way (unchanged)',
});

const TIE_PRIORITY = ['P-R', 'H', 'I', 'OS'];

function asMultiPolygon(geometry) {
	if (geometry.type === 'Polygon') return [geometry.coordinates];
	if (geometry.type === 'MultiPolygon') return geometry.coordinates;
	throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function ringArea(ring) {
	let twiceArea = 0;
	for (let i = 0; i < ring.length - 1; i++) {
		const [x1, y1] = ring[i];
		const [x2, y2] = ring[i + 1];
		twiceArea += x1 * y2 - x2 * y1;
	}
	return Math.abs(twiceArea) / 2;
}

function multiPolygonArea(multiPolygon) {
	let area = 0;
	for (const polygon of multiPolygon) {
		if (!polygon.length) continue;
		area += ringArea(polygon[0]);
		for (let i = 1; i < polygon.length; i++) area -= ringArea(polygon[i]);
	}
	return area;
}

function boundsOf(geometry) {
	let west = Infinity;
	let south = Infinity;
	let east = -Infinity;
	let north = -Infinity;
	function visit(value) {
		if (typeof value[0] === 'number') {
			west = Math.min(west, value[0]);
			south = Math.min(south, value[1]);
			east = Math.max(east, value[0]);
			north = Math.max(north, value[1]);
			return;
		}
		for (const child of value) visit(child);
	}
	visit(geometry.coordinates);
	return { west, south, east, north };
}

function boundsOverlap(a, b) {
	return a.west < b.east && a.east > b.west && a.south < b.north && a.north > b.south;
}

function centerOfGeometry(geometry) {
	const bounds = boundsOf(geometry);
	return [
		Number(((bounds.west + bounds.east) / 2).toFixed(6)),
		Number(((bounds.south + bounds.north) / 2).toFixed(6)),
	];
}

function translateMultiPolygon(multiPolygon, origin) {
	return multiPolygon.map((polygon) =>
		polygon.map((ring) =>
			ring.map(([x, y]) => [x - origin.west, y - origin.south]),
		),
	);
}

function prepareZones(features) {
	const byCode = new Map();
	for (const feature of features) {
			const code = feature.properties?.ZONED;
			if (!CROSSWALK[code]) throw new Error(`No Opticos crosswalk entry for Village district ${code}`);
			const geometries = byCode.get(code) ?? [];
			geometries.push(asMultiPolygon(feature.geometry));
			byCode.set(code, geometries);
	}

	return [...byCode]
		.flatMap(([code, geometries]) => {
			const merged = polygonClipping.union(...geometries);
			return merged.map((polygon) => {
				const geometry = { type: 'Polygon', coordinates: polygon };
				return {
					code,
					geometry: [polygon],
					bounds: boundsOf(geometry),
				};
			});
		})
		.sort((a, b) => a.code.localeCompare(b.code));
}

function compareOverlap(a, b) {
	const difference = b.area - a.area;
	const scale = Math.max(a.area, b.area);
	if (scale && Math.abs(difference) / scale > 1e-9) return difference;
	const aPriority = TIE_PRIORITY.indexOf(a.code);
	const bPriority = TIE_PRIORITY.indexOf(b.code);
	if (aPriority >= 0 || bPriority >= 0) {
		return (aPriority < 0 ? Infinity : aPriority) - (bPriority < 0 ? Infinity : bPriority);
	}
	return a.code.localeCompare(b.code);
}

function assignParcel(parcelGeometry, zones) {
	const parcel = asMultiPolygon(parcelGeometry);
	const parcelBounds = boundsOf(parcelGeometry);
	const localParcel = translateMultiPolygon(parcel, parcelBounds);
	const overlapByCode = new Map();

	for (const zone of zones) {
		if (!boundsOverlap(parcelBounds, zone.bounds)) continue;
		const localZone = translateMultiPolygon(zone.geometry, parcelBounds);
		const clipped = polygonClipping.intersection(localParcel, localZone);
		const area = multiPolygonArea(clipped);
		if (area > 0) overlapByCode.set(zone.code, (overlapByCode.get(zone.code) ?? 0) + area);
	}

	const overlaps = [...overlapByCode]
		.map(([code, area]) => ({ code, area }))
		.sort(compareOverlap);
	if (!overlaps.length) return null;

	const parcelArea = multiPolygonArea(localParcel);
	const totalArea = overlaps.reduce((sum, overlap) => sum + overlap.area, 0);
	return {
		existingZone: overlaps[0].code,
		proposedZone: CROSSWALK[overlaps[0].code],
		coverage: parcelArea ? overlaps[0].area / parcelArea : 0,
		totalCoverage: parcelArea ? totalArea / parcelArea : 0,
		secondCoverage: parcelArea && overlaps[1] ? overlaps[1].area / parcelArea : 0,
		overlaps,
	};
}

function roundGeometry(geometry, digits = 6) {
	const factor = 10 ** digits;
	function visit(value) {
		if (typeof value[0] === 'number') {
			value[0] = Math.round(value[0] * factor) / factor;
			value[1] = Math.round(value[1] * factor) / factor;
			return;
		}
		for (const child of value) visit(child);
	}
	visit(geometry.coordinates);
	return geometry;
}

module.exports = {
	CROSSWALK,
	DISTRICT_NAMES,
	assignParcel,
	centerOfGeometry,
	prepareZones,
	roundGeometry,
};
