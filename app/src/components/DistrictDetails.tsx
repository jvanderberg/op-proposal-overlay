import { X } from 'lucide-react';
import { DISTRICTS, ZONE_ORDER } from '../constants';
import { useStore } from '../store';

const MAIN = ZONE_ORDER.filter((z) => !['H', 'I', 'OS', 'P-R'].includes(z));

export function DistrictDetails() {
	const panel = useStore((s) => s.panel);
	const setPanel = useStore((s) => s.setPanel);
	if (panel !== 'districts') return null;

	return (
		<div className="absolute top-[54px] right-3 z-[1000] max-h-[calc(100dvh-66px)] w-[340px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-[10px] border border-neutral-200 bg-white/95 p-4 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
			<button
				type="button"
				aria-label="Close"
				className="float-right rounded-md p-1 text-neutral-500 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
				onClick={() => setPanel('districts')}
			>
				<X size={16} />
			</button>
			<strong className="text-[14px]">Proposed districts</strong>
			<div className="mt-2">
				{MAIN.map((z) => (
					<div
						key={z}
						className="flex gap-2 border-neutral-200 border-t py-1.5 first:border-t-0 dark:border-neutral-700"
					>
						<span
							className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[3px] border border-black/30"
							style={{ background: DISTRICTS[z].color }}
						/>
						<div className="text-[12px]">
							<b>
								{z} · {DISTRICTS[z].name}
							</b>{' '}
							<span className="text-neutral-500 dark:text-neutral-300">
								(from {DISTRICTS[z].from})
							</span>
							<p className="mt-0.5 text-neutral-500 dark:text-neutral-300">
								{DISTRICTS[z].detail}
							</p>
						</div>
					</div>
				))}
			</div>
			<p className="mt-2.5 text-[10.5px] text-neutral-500 dark:text-neutral-300">
				Standards summarized from Opticos’s Zoning Recommendations (Tables 4-1
				&amp; 5-1).
			</p>
		</div>
	);
}
