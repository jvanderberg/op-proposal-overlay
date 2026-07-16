import type { ParcelCollection } from '../types';
import { SearchInput } from './SearchInput';

interface Props {
	data: ParcelCollection | null;
	total: number;
	error: string | null;
}

export function TitleCard({ data, total, error }: Props) {
	return (
		<div className="absolute top-3 left-3 z-[1000] max-w-[350px] rounded-[10px] border border-neutral-200 bg-white/95 p-4 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
			<h1 className="font-semibold text-[15px] tracking-tight">
				Proposed Zoning — “Zoning for Tomorrow”
			</h1>
			<p className="mt-0.5 text-[12px] text-neutral-500 leading-snug max-sm:hidden">
				Opticos’s recommended district crosswalk applied to Oak Park’s{' '}
				<em>existing</em> zoning, tagged onto all{' '}
				<strong>{total ? total.toLocaleString() : '—'}</strong> parcels.
			</p>
			<div className="mt-2 text-[11px] text-neutral-500 max-sm:hidden">
				Deterministic from the Zoning Recommendations report (2026-07-07) · not
				yet adopted
			</div>
			{error ? (
				<div className="mt-2 text-[12px] text-red-600">
					Failed to load parcels: {error}
				</div>
			) : (
				<SearchInput data={data} />
			)}
		</div>
	);
}
