import type { SearchEntry } from '../types';
import { SearchInput } from './SearchInput';

interface Props {
	searchEntries: SearchEntry[];
	total: number;
	error: string | null;
}

export function TitleCard({ searchEntries, total, error }: Props) {
	return (
		<section className="p-4 pb-3">
			<h1 className="pr-14 font-semibold text-[15px] tracking-tight">
				Oak Park zoning proposal
			</h1>
			<p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-300">
				Opticos · “Zoning for Tomorrow”
			</p>
			<p className="mt-1.5 text-[12px] text-neutral-500 leading-snug dark:text-neutral-300 max-sm:hidden">
				Opticos’s proposed district crosswalk applied to the Village’s existing
				zoning map and matched to all{' '}
				<strong>{total ? total.toLocaleString() : '—'}</strong> parcels.
			</p>
			<div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-300 max-sm:hidden">
				Sources: Opticos Zoning Recommendations (July 7, 2026), Village zoning
				map, and existing parcel map · not adopted
			</div>
			{error ? (
				<div className="mt-2 text-[12px] text-red-600">
					Failed to load map data: {error}
				</div>
			) : (
				<SearchInput entries={searchEntries} />
			)}
		</section>
	);
}
