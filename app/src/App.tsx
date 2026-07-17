import { useEffect, useState } from 'react';
import { DistrictDetails } from './components/DistrictDetails';
import { InfoPanel } from './components/InfoPanel';
import { MapControls } from './components/MapControls';
import { MapView } from './components/MapView';
import { useStore } from './store';
import type {
	SearchEntry,
	SearchTuple,
	ZoneCode,
	ZoningSummary,
} from './types';

const SUMMARY_URL = `${import.meta.env.BASE_URL}zoning_summary.json`;
const SEARCH_URL = `${import.meta.env.BASE_URL}parcel_search.json`;

export function App() {
	const [searchEntries, setSearchEntries] = useState<SearchEntry[]>([]);
	const [counts, setCounts] = useState({} as Record<ZoneCode, number>);
	const [total, setTotal] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const selectedPin = useStore((state) => state.selectedPin);

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([
			fetch(SUMMARY_URL, { signal: controller.signal }),
			fetch(SEARCH_URL, { signal: controller.signal }),
		])
			.then(async ([summaryResponse, searchResponse]) => {
				if (!summaryResponse.ok) {
					throw new Error(
						`${summaryResponse.status} ${summaryResponse.statusText}`,
					);
				}
				if (!searchResponse.ok) {
					throw new Error(
						`${searchResponse.status} ${searchResponse.statusText}`,
					);
				}
				return Promise.all([
					summaryResponse.json() as Promise<ZoningSummary>,
					searchResponse.json() as Promise<SearchTuple[]>,
				]);
			})
			.then(([summary, tuples]) => {
				setCounts(summary.summary);
				setTotal(summary.total);
				setSearchEntries(
					tuples.map(([pin, address, zone, longitude, latitude]) => ({
						pin,
						address,
						zone,
						center: [longitude, latitude],
					})),
				);
			})
			.catch((fetchError: unknown) => {
				if (!controller.signal.aborted) setError(String(fetchError));
			});
		return () => controller.abort();
	}, []);

	useEffect(() => {
		const url = new URL(window.location.href);
		if (selectedPin) url.searchParams.set('pin', selectedPin);
		else url.searchParams.delete('pin');
		window.history.replaceState(null, '', url);
	}, [selectedPin]);

	return (
		<div className="relative h-dvh w-dvw overflow-hidden">
			<MapView searchEntries={searchEntries} />
			<MapControls
				searchEntries={searchEntries}
				counts={counts}
				total={total}
				error={error}
			/>
			<InfoPanel />
			<DistrictDetails />
		</div>
	);
}
