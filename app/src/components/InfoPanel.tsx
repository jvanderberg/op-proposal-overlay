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
				className="absolute top-3 right-3 z-[1000] flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-neutral-200 bg-white/95 font-bold shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95"
			>
				i
			</button>
			{panel === 'info' && (
				<div className="absolute top-[54px] right-3 z-[1000] max-h-[78dvh] max-w-[340px] overflow-y-auto rounded-[10px] border border-neutral-200 bg-white/95 p-4 text-[12px] leading-relaxed shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95 max-sm:left-3 max-sm:max-w-none">
					<strong>How this map was made</strong>
					<p className="mt-1">
						Opticos’s report (Article 3) proposes <em>consolidating</em> Oak
						Park’s existing zoning districts into fewer, clearer ones. This map
						applies that crosswalk to the Village’s existing zoning layer and
						tags each parcel — a <em>deterministic</em> translation, not a
						guess.
					</p>
					<p className="mt-2">
						<strong>The crosswalk:</strong>
						<br />
						R-1 → N-1 · {'{R-2, R-3-50, R-3-35, R-4, R-5}'} → N-2 ·{' '}
						{'{R-6, R-7}'} → N-3
						<br />
						DT-1/2/3 → unchanged · {'{HS, NC}'} → M-1 · RR → M-2 ·{' '}
						{'{GC, MS, NA}'} → M-3
						<br />
						Special districts (H, I, OS, P-R) are unchanged.
					</p>
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
					<button
						type="button"
						className="mt-3 text-[12px] text-neutral-500 underline"
						onClick={() => setPanel('info')}
					>
						Close
					</button>
				</div>
			)}
		</>
	);
}
