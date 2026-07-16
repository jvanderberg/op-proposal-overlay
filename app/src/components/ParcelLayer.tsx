import type { Layer, GeoJSON as LeafletGeoJSON, PathOptions } from 'leaflet';
import { geoJSON } from 'leaflet';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { DISTRICTS } from '../constants';
import { useStore } from '../store';
import type { ParcelCollection, ParcelFeature, ZoneCode } from '../types';

function styleFor(
	zone: ZoneCode,
	active: Set<ZoneCode>,
	isDark: boolean,
): PathOptions {
	const on = active.has(zone);
	return {
		color: isDark ? '#0c0f13' : '#ffffff',
		weight: 0.25,
		fillColor: DISTRICTS[zone]?.color ?? '#888888',
		fillOpacity: on ? 0.82 : 0,
		opacity: on ? 0.45 : 0,
	};
}

function popupHtml(p: ParcelFeature['properties']): string {
	const d = DISTRICTS[p.proposed_zone];
	const textColor =
		p.proposed_zone === 'N-1' || p.proposed_zone === 'DT-3' ? '#333' : '#fff';
	return [
		`<div><span style="display:inline-block;padding:1px 7px;border-radius:999px;font-weight:600;font-size:11px;background:${d.color};color:${textColor}">${p.proposed_zone}</span> <strong>${d.name}</strong></div>`,
		`<div style="margin-top:4px">Existing <b>${p.existing_zone}</b> &rarr; proposed <b>${p.proposed_zone}</b></div>`,
		`<details style="margin-top:6px"><summary style="cursor:pointer;color:#c02026">What this district allows</summary><div style="margin-top:4px">${d.detail}</div></details>`,
		'<hr style="border:none;border-top:1px solid rgba(128,128,128,.3);margin:7px 0"/>',
		`<strong>${p.address || '—'}</strong><br/>PIN ${p.pin} &middot; class ${p.class}<br/>`,
		`<span style="opacity:.7">${p.description ?? ''}</span><br/>`,
		`<a href="${p.url}" target="_blank" rel="noopener">Assessor record &#8599;</a>`,
	].join('');
}

export function ParcelLayer({
	data,
	isDark,
}: {
	data: ParcelCollection;
	isDark: boolean;
}) {
	const map = useMap();
	const layerRef = useRef<LeafletGeoJSON | null>(null);
	const byPin = useRef(new Map<string, Layer>());
	const highlighted = useRef<Layer | null>(null);

	const activeZones = useStore((s) => s.activeZones);
	const selectedPin = useStore((s) => s.selectedPin);
	const setSelectedPin = useStore((s) => s.setSelectedPin);

	// build the layer once
	useEffect(() => {
		byPin.current.clear();
		const layer = geoJSON(data, {
			style: (feature) =>
				styleFor(
					(feature as ParcelFeature).properties.proposed_zone,
					useStore.getState().activeZones,
					isDark,
				),
			onEachFeature: (feature, lyr) => {
				const props = (feature as ParcelFeature).properties;
				byPin.current.set(props.pin, lyr);
				lyr.bindPopup(() => popupHtml(props));
				lyr.on('click', () => setSelectedPin(props.pin));
			},
		}).addTo(map);
		layerRef.current = layer;
		return () => {
			layer.remove();
			layerRef.current = null;
		};
	}, [data, map, isDark, setSelectedPin]);

	// restyle on filter change
	useEffect(() => {
		layerRef.current?.setStyle((feature) =>
			styleFor(
				(feature as ParcelFeature).properties.proposed_zone,
				activeZones,
				isDark,
			),
		);
	}, [activeZones, isDark]);

	// react to selection: highlight + fly + open popup
	useEffect(() => {
		const layer = layerRef.current;
		if (!layer) return;
		if (highlighted.current) {
			layer.resetStyle(highlighted.current);
			highlighted.current = null;
		}
		if (!selectedPin) return;
		const target = byPin.current.get(selectedPin);
		if (!target) return;
		highlighted.current = target;
		if ('setStyle' in target && typeof target.setStyle === 'function') {
			target.setStyle({
				color: '#111',
				weight: 2.5,
				opacity: 1,
				fillOpacity: 0.9,
			});
		}
		if ('bringToFront' in target && typeof target.bringToFront === 'function') {
			target.bringToFront();
		}
		if ('getBounds' in target && typeof target.getBounds === 'function') {
			const animate = !window.matchMedia('(prefers-reduced-motion: reduce)')
				.matches;
			map.setView(target.getBounds().getCenter(), Math.max(map.getZoom(), 17), {
				animate,
			});
		}
		target.openPopup();
	}, [selectedPin, map]);

	return null;
}
