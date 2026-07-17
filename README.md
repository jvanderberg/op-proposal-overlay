# Oak Park — Proposed Zoning Crosswalk

An interactive parcel map of Opticos Design's July 2026 **Zoning for Tomorrow**
recommendations for Oak Park, Illinois.

**Live site:** <https://jvanderberg.github.io/op-proposal-overlay/>

![Map preview](docs/preview.png)

## What the map shows

Opticos recommends consolidating Oak Park's existing zoning districts into a
smaller set of proposed districts. This project applies the report's published
crosswalk to the Village's existing zoning map, then assigns the result to all
17,523 Cook County parcel polygons.

| Existing Village district | Proposed Opticos district |
|---|---|
| R-1 | N-1 |
| R-2, R-3-50, R-3-35, R-4, R-5 | N-2 |
| R-6, R-7 | N-3 |
| HS, NC | M-1 |
| RR | M-2 |
| GC, MS, NA | M-3 |
| DT-1, DT-2, DT-3, H, I, OS, P-R | unchanged |

Search by address or PIN, select a parcel for its existing and proposed
districts, filter districts from the legend, or compare the parcel result with
the original Opticos map images.

## Important caveat

This is a deterministic application of Opticos's **district crosswalk** to the
Village's saved existing-zoning map. It is not an adopted zoning map and cannot
anticipate parcel-specific map edits the Village or Opticos may make during the
legislative process.

Some Village zoning polygons overlap or leave small coverage gaps around parcel
boundaries. The generator resolves overlaps by greatest parcel area, uses an
explicit priority for exact special-district ties, never silently substitutes a
default district, and records boundary and low-coverage cases in
[`zoning_summary.json`](app/public/zoning_summary.json).

## Deterministic data pipeline

The checked-in inputs and method make ordinary regeneration repeatable:

1. Read the saved Village existing-zoning snapshot from
   [`data/village_existing_zoning.geojson`](data/village_existing_zoning.geojson).
2. Read Cook County parcels from the neighboring `oak-park-properties` checkout,
   or a path supplied with `--parcels`.
3. Intersect every parcel with candidate Village zoning polygons and select the
   district covering the greatest area. Exact ties prefer special-purpose
   districts in a documented order, then district code.
4. Apply the Opticos crosswalk and fail if any parcel has zero zoning overlap.
5. Remove unused source attributes and round coordinates to six decimal places,
   reducing the browser payload without materially changing parcel placement.

```sh
npm run extract

# Use a parcel file somewhere else:
node scripts/extract-proposed-zoning.cjs --parcels /path/to/parcels.geojson
```

Updating the Village input is a separate, explicit operation because the live
ArcGIS layer can change over time. It saves the new snapshot and regenerates the
derived files:

```sh
npm run refresh:zoning
```

The crosswalk and spatial assignment code live in
[`scripts/zoning-data.cjs`](scripts/zoning-data.cjs). The generated outputs are:

- [`app/public/parcels_proposed_zoning.geojson`](app/public/parcels_proposed_zoning.geojson)
- [`app/public/parcel_search.json`](app/public/parcel_search.json)
- [`app/public/zoning_summary.json`](app/public/zoning_summary.json)
- [`data/existing_zoning_crosswalked.geojson`](data/existing_zoning_crosswalked.geojson)

## Development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

The app is Vite, React, TypeScript, MapLibre GL JS, Tailwind CSS, and Zustand.
MapLibre fetches, worker-tiles, and renders the parcel GeoJSON with WebGL; React
loads only the compact address/PIN search index and zoning summary. The CARTO /
OpenStreetMap street basemap remains a raster layer. There is no backend. GitHub
Actions builds and deploys `main` to GitHub Pages.

Run the complete verification suite with:

```sh
npm run check   # TypeScript, Biome, data tests, and UI behavior tests
npm run build   # production build
```

## Sources

- **Existing zoning:** Village of Oak Park / GIS Consortium ArcGIS layer, saved
  in this repository so regeneration does not change unexpectedly.
- **Parcels:** Cook County GIS parcel polygons via
  [oak-park-properties](https://github.com/jvanderberg/oak-park-properties).
- **Crosswalk and proposed standards:** Opticos Design, *MMH Zoning Update:
  Zoning Recommendations*, July 7, 2026, available from
  [Shape Oak Park](https://engageoakpark.com/shape/documents).
