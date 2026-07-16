import { useEffect, useMemo, useState } from 'react';
import { DistrictDetails } from './components/DistrictDetails';
import { InfoPanel } from './components/InfoPanel';
import { Legend } from './components/Legend';
import { MapView } from './components/MapView';
import { TitleCard } from './components/TitleCard';
import { useStore } from './store';
import type { ParcelCollection, ZoneCode } from './types';

const DATA_URL = `${import.meta.env.BASE_URL}parcels_proposed_zoning.geojson`;

export function App() {
	const [data, setData] = useState<ParcelCollection | null>(null);
	const [error, setError] = useState<string | null>(null);
	const selectedPin = useStore((s) => s.selectedPin);

	useEffect(() => {
		let alive = true;
		fetch(DATA_URL)
			.then((r) => {
				if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
				return r.json() as Promise<ParcelCollection>;
			})
			.then((fc) => alive && setData(fc))
			.catch((e: unknown) => alive && setError(String(e)));
		return () => {
			alive = false;
		};
	}, []);

	// keep ?pin= in the URL in sync with the selected parcel
	useEffect(() => {
		const url = new URL(window.location.href);
		if (selectedPin) {
			url.searchParams.set('pin', selectedPin);
		} else {
			url.searchParams.delete('pin');
		}
		window.history.replaceState(null, '', url);
	}, [selectedPin]);

	const counts = useMemo(() => {
		const c = {} as Record<ZoneCode, number>;
		if (data) {
			for (const f of data.features) {
				const z = f.properties.proposed_zone;
				c[z] = (c[z] ?? 0) + 1;
			}
		}
		return c;
	}, [data]);

	const total = data?.features.length ?? 0;

	return (
		<div className="relative h-dvh w-dvw overflow-hidden">
			<MapView data={data} />
			<TitleCard data={data} total={total} error={error} />
			<Legend counts={counts} />
			<InfoPanel />
			<DistrictDetails />
		</div>
	);
}
