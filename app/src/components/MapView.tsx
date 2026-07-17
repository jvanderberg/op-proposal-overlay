import maplibregl, {
	type GeoJSONFeature,
	type LngLatLike,
	type Map as MapLibreMap,
	type MapMouseEvent,
	type Popup,
	type RasterTileSource,
} from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	CARTO_DARK,
	CARTO_LIGHT,
	OVERLAY_BOUNDS,
	UNDERLAYS,
} from '../constants';
import {
	baseStyle,
	selectedFilter,
	ZONE_COLOR_EXPRESSION,
	zoneFilter,
} from '../mapStyle';
import { useStore } from '../store';
import type { ParcelProps, SearchEntry } from '../types';
import { MobileParcelPopup } from './MobileParcelPopup';
import { popupContent } from './ParcelPopup';

const PARCELS_URL = `${import.meta.env.BASE_URL}parcels_proposed_zoning.geojson`;
const PARCEL_SOURCE = 'parcels';
const PARCEL_FILL = 'parcel-fill';
const PARCEL_OUTLINE = 'parcel-outline';
const SELECTED_FILL = 'parcel-selected-fill';
const SELECTED_OUTLINE = 'parcel-selected-outline';
const PARCEL_LAYERS = [SELECTED_FILL, PARCEL_FILL];
const POPUP_OPTIONS = { maxWidth: '380px', focusAfterOpen: false } as const;
const MOBILE_POPUP_QUERY =
	'(max-width: 640px), (max-height: 500px) and (pointer: coarse)';

function overlayCoordinates(): [
	[number, number],
	[number, number],
	[number, number],
	[number, number],
] {
	const [[south, west], [north, east]] = OVERLAY_BOUNDS;
	return [
		[west, north],
		[east, north],
		[east, south],
		[west, south],
	];
}

function parcelProperties(feature: GeoJSONFeature): ParcelProps {
	const properties = feature.properties;
	return {
		pin: String(properties.pin),
		address: String(properties.address ?? ''),
		class: String(properties.class ?? ''),
		description: String(properties.description ?? ''),
		existing_zone: String(properties.existing_zone),
		proposed_zone: String(
			properties.proposed_zone,
		) as ParcelProps['proposed_zone'],
	};
}

export function MapView({ searchEntries }: { searchEntries: SearchEntry[] }) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const popupPinRef = useRef<string | null>(null);
	const [ready, setReady] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const [mobilePopup, setMobilePopup] = useState<ParcelProps | null>(null);

	const activeZones = useStore((state) => state.activeZones);
	const selectedPin = useStore((state) => state.selectedPin);
	const setSelectedPin = useStore((state) => state.setSelectedPin);
	const underlay = useStore((state) => state.underlay);
	const underlayOpacity = useStore((state) => state.underlayOpacity);
	const searchByPin = useMemo(
		() => new Map(searchEntries.map((entry) => [entry.pin, entry])),
		[searchEntries],
	);

	useEffect(() => {
		if (!containerRef.current) return;
		const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const mobilePopupQuery = window.matchMedia(MOBILE_POPUP_QUERY);
		const isDark = themeQuery.matches;
		let map: MapLibreMap;
		try {
			map = new maplibregl.Map({
				container: containerRef.current,
				style: baseStyle(isDark),
				center: [-87.789, 41.888],
				zoom: 14,
				minZoom: 12,
				maxZoom: 20,
			});
		} catch (error) {
			setMapError(
				`This browser could not start the WebGL map: ${String(error)}`,
			);
			return;
		}
		mapRef.current = map;
		function updateTheme(event: MediaQueryListEvent) {
			const dark = event.matches;
			const carto = map.getSource('carto') as RasterTileSource | undefined;
			carto?.setTiles(dark ? CARTO_DARK : CARTO_LIGHT);
			if (map.getLayer(PARCEL_OUTLINE)) {
				map.setPaintProperty(
					PARCEL_OUTLINE,
					'line-color',
					dark ? '#15191f' : '#ffffff',
				);
			}
		}
		themeQuery.addEventListener('change', updateTheme);
		map.addControl(
			new maplibregl.NavigationControl({ showCompass: false }),
			'bottom-right',
		);

		function showPopup(feature: GeoJSONFeature, location: LngLatLike) {
			const properties = parcelProperties(feature);
			popupRef.current?.remove();
			if (mobilePopupQuery.matches) {
				popupRef.current = null;
				popupPinRef.current = properties.pin;
				setMobilePopup(properties);
				return;
			}
			setMobilePopup(null);
			popupRef.current = new maplibregl.Popup(POPUP_OPTIONS)
				.setLngLat(location)
				.setDOMContent(popupContent(properties))
				.addTo(map);
			popupPinRef.current = properties.pin;
		}

		function interactiveFeature(event: MapMouseEvent) {
			return map.queryRenderedFeatures(event.point, {
				layers: PARCEL_LAYERS,
			})[0];
		}

		map.on('load', () => {
			map.addSource(PARCEL_SOURCE, {
				type: 'geojson',
				data: PARCELS_URL,
				promoteId: 'pin',
				maxzoom: 18,
				buffer: 32,
			});
			map.addLayer({
				id: PARCEL_FILL,
				type: 'fill',
				source: PARCEL_SOURCE,
				paint: {
					'fill-color': ZONE_COLOR_EXPRESSION,
					'fill-opacity': 0.82,
				},
			});
			map.addLayer({
				id: PARCEL_OUTLINE,
				type: 'line',
				source: PARCEL_SOURCE,
				paint: {
					'line-color': isDark ? '#0c0f13' : '#ffffff',
					'line-width': 0.35,
					'line-opacity': 0.45,
				},
			});

			for (const option of UNDERLAYS.filter((item) => item.value)) {
				const sourceId = `opticos-${option.value}`;
				const layerId = `${sourceId}-layer`;
				map.addSource(sourceId, {
					type: 'image',
					url: `${import.meta.env.BASE_URL}${option.value}`,
					coordinates: overlayCoordinates(),
				});
				map.addLayer({
					id: layerId,
					type: 'raster',
					source: sourceId,
					layout: { visibility: 'none' },
					paint: { 'raster-opacity': 0.8, 'raster-fade-duration': 0 },
				});
			}

			map.addLayer({
				id: SELECTED_FILL,
				type: 'fill',
				source: PARCEL_SOURCE,
				filter: selectedFilter(null),
				paint: { 'fill-color': ZONE_COLOR_EXPRESSION, 'fill-opacity': 0.92 },
			});
			map.addLayer({
				id: SELECTED_OUTLINE,
				type: 'line',
				source: PARCEL_SOURCE,
				filter: selectedFilter(null),
				paint: {
					'line-color': '#111111',
					'line-width': 2.5,
					'line-opacity': 1,
				},
			});

			map.on('click', (event) => {
				const feature = interactiveFeature(event);
				if (!feature) return;
				const properties = parcelProperties(feature);
				setSelectedPin(properties.pin);
				showPopup(feature, event.lngLat);
			});
			map.on('mousemove', (event) => {
				map.getCanvas().style.cursor = interactiveFeature(event)
					? 'pointer'
					: '';
			});
			setReady(true);
		});

		return () => {
			themeQuery.removeEventListener('change', updateTheme);
			popupRef.current?.remove();
			map.remove();
			mapRef.current = null;
		};
	}, [setSelectedPin]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !ready) return;
		const filter = zoneFilter(activeZones);
		map.setFilter(PARCEL_FILL, filter);
		map.setFilter(PARCEL_OUTLINE, filter);
	}, [activeZones, ready]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !ready) return;
		for (const option of UNDERLAYS.filter((item) => item.value)) {
			const layerId = `opticos-${option.value}-layer`;
			map.setLayoutProperty(
				layerId,
				'visibility',
				option.value === underlay ? 'visible' : 'none',
			);
			map.setPaintProperty(layerId, 'raster-opacity', underlayOpacity);
		}
	}, [ready, underlay, underlayOpacity]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !ready) return;
		map.setFilter(SELECTED_FILL, selectedFilter(selectedPin));
		map.setFilter(SELECTED_OUTLINE, selectedFilter(selectedPin));
		if (!selectedPin) {
			popupRef.current?.remove();
			popupPinRef.current = null;
			setMobilePopup(null);
			return;
		}

		const entry = searchByPin.get(selectedPin);
		if (!entry) return;
		const animate = !window.matchMedia('(prefers-reduced-motion: reduce)')
			.matches;
		map.easeTo({
			center: entry.center,
			zoom: Math.max(map.getZoom(), 17),
			duration: animate ? 700 : 0,
		});
		if (popupPinRef.current === selectedPin) return;

		map.once('idle', () => {
			const feature = map.queryRenderedFeatures({ layers: [SELECTED_FILL] })[0];
			if (!feature || String(feature.properties.pin) !== selectedPin) return;
			const properties = parcelProperties(feature);
			if (window.matchMedia(MOBILE_POPUP_QUERY).matches) {
				popupRef.current?.remove();
				popupRef.current = null;
				setMobilePopup(properties);
				popupPinRef.current = selectedPin;
				return;
			}
			setMobilePopup(null);
			popupRef.current?.remove();
			popupRef.current = new maplibregl.Popup(POPUP_OPTIONS)
				.setLngLat(entry.center)
				.setDOMContent(popupContent(properties))
				.addTo(map);
			popupPinRef.current = selectedPin;
		});
	}, [ready, searchByPin, selectedPin]);

	return (
		<>
			<div ref={containerRef} className="absolute inset-0 h-full w-full" />
			{mobilePopup && (
				<MobileParcelPopup
					parcel={mobilePopup}
					onClose={() => setSelectedPin(null)}
				/>
			)}
			{mapError && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 p-8 text-center text-red-700 dark:bg-neutral-950 dark:text-red-300">
					{mapError}
				</div>
			)}
		</>
	);
}
