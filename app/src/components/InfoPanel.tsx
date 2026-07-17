import { Info, X } from 'lucide-react';
import { useStore } from '../store';

export function InfoPanel() {
	const panel = useStore((s) => s.panel);
	const setPanel = useStore((s) => s.setPanel);

	return (
		<>
			<button
				type="button"
				aria-label="Data sources and method"
				onClick={() => setPanel('info')}
				className="info-trigger fixed z-[1000] flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-neutral-200 bg-white/95 shadow-md backdrop-blur hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/95 dark:hover:bg-neutral-800"
			>
				<Info size={17} />
			</button>
			{panel === 'info' && (
				<div className="context-panel fixed z-[1000] w-[340px] overflow-y-auto rounded-[10px] border border-neutral-200 bg-white/95 p-4 text-[12px] leading-relaxed shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
					<button
						type="button"
						aria-label="Close data sources and method"
						className="float-right rounded-md p-1 text-neutral-500 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
						onClick={() => setPanel('info')}
					>
						<X size={16} />
					</button>
					<strong className="text-[14px]">How this map was made</strong>
					<p className="mt-1">
						Opticos’s report (Article 3) proposes <em>consolidating</em> Oak
						Park’s existing zoning districts into fewer, clearer ones. This map
						applies that published crosswalk to the Village’s existing zoning
						map, then matches the result to the existing parcel map.
					</p>
					<div className="mt-2">
						<strong>The crosswalk:</strong>
						<ul className="mt-1 list-disc space-y-0.5 pl-4">
							<li>R-1 → N-1</li>
							<li>R-2 through R-5 → N-2</li>
							<li>R-6 and R-7 → N-3</li>
							<li>HS and NC → M-1 · RR → M-2 · GC, MS, and NA → M-3</li>
							<li>
								Downtown and special districts retain their district map labels
							</li>
						</ul>
					</div>
					<p className="mt-2">
						<strong>Check it yourself:</strong> use “Compare to Opticos” in the
						legend to fade in Opticos’s own “Zoning for Tomorrow” map and see
						how the parcels line up.
					</p>
					<p className="mt-2">
						<strong>Caveat:</strong> a pure crosswalk won’t capture
						parcel-specific map edits Opticos may apply during adoption. Not
						adopted zoning.
					</p>
					<p className="mt-2">
						<strong>Sources:</strong> existing zoning &amp; parcels — Village of
						Oak Park / GIS Consortium &amp; Cook County; crosswalk — Opticos{' '}
						<em>MMH Zoning Update: Zoning Recommendations</em> (
						<a
							className="text-red-700 dark:text-red-300"
							href="https://engageoakpark.com/shape/documents"
							target="_blank"
							rel="noopener"
						>
							Shape Oak Park
						</a>
						).
					</p>
				</div>
			)}
		</>
	);
}
