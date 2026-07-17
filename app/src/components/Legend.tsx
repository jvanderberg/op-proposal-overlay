import { CircleHelp } from 'lucide-react';
import { DISTRICTS, FAMILIES, UNDERLAYS, ZONE_ORDER } from '../constants';
import { useStore } from '../store';
import type { ZoneCode } from '../types';

export function Legend({ counts }: { counts: Record<ZoneCode, number> }) {
	const activeZones = useStore((s) => s.activeZones);
	const toggleZone = useStore((s) => s.toggleZone);
	const setAllZones = useStore((s) => s.setAllZones);
	const setPanel = useStore((s) => s.setPanel);
	const underlay = useStore((s) => s.underlay);
	const setUnderlay = useStore((s) => s.setUnderlay);
	const opacity = useStore((s) => s.underlayOpacity);
	const setOpacity = useStore((s) => s.setUnderlayOpacity);

	return (
		<section className="border-neutral-200 border-t px-3 pt-2.5 pb-3 dark:border-neutral-700">
			<div className="mb-1.5 flex items-start justify-between gap-3">
				<div>
					<p className="text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-300">
						Districts
					</p>
					<p className="mt-0.5 text-[10.5px] text-neutral-500 dark:text-neutral-300">
						Select districts to show or hide them
					</p>
				</div>
				<button
					type="button"
					className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-red-700 hover:bg-red-700/10 dark:text-red-300"
					onClick={() => setPanel('districts')}
				>
					<CircleHelp size={13} />
					Guide
				</button>
			</div>
			<div className="mb-1 flex gap-1 text-[10.5px]">
				<button
					type="button"
					onClick={() => setAllZones(true)}
					className="rounded-md border border-neutral-200 px-2 py-0.5 hover:bg-black/5 dark:border-neutral-700 dark:hover:bg-white/10"
				>
					Show all
				</button>
				<button
					type="button"
					onClick={() => setAllZones(false)}
					className="rounded-md border border-neutral-200 px-2 py-0.5 hover:bg-black/5 dark:border-neutral-700 dark:hover:bg-white/10"
				>
					Hide all
				</button>
			</div>

			<div className="max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-2">
				{FAMILIES.map((fam) => {
					const codes = ZONE_ORDER.filter(
						(z) => DISTRICTS[z].family === fam && counts[z],
					);
					if (!codes.length) return null;
					return (
						<div key={fam} className="max-sm:col-span-2">
							<div className="mt-1.5 mb-0.5 text-[10px] text-neutral-500 uppercase tracking-wide dark:text-neutral-300">
								{fam}
							</div>
							{codes.map((z) => (
								<button
									type="button"
									key={z}
									aria-pressed={activeZones.has(z)}
									onClick={() => toggleZone(z)}
									className={`flex w-full items-center gap-2 rounded-md px-1.5 py-[3px] text-left text-[12.5px] transition hover:bg-black/5 dark:hover:bg-white/10 ${activeZones.has(z) ? '' : 'opacity-40 grayscale'}`}
								>
									<span
										className="h-3.5 w-3.5 shrink-0 rounded-[3px] border border-black/30"
										style={{ background: DISTRICTS[z].color }}
									/>
									{z}{' '}
									{DISTRICTS[z].name.replace(
										/ Sub-District| \(unchanged\)/,
										'',
									)}
									<span className="ml-auto shrink-0 text-[10.5px] text-neutral-500 tabular-nums dark:text-neutral-300">
										{counts[z].toLocaleString()}
									</span>
								</button>
							))}
						</div>
					);
				})}
			</div>

			<div className="mt-2.5 border-neutral-200 border-t pt-2 dark:border-neutral-700">
				<p className="mb-1.5 text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-300">
					Compare to Opticos
				</p>
				<select
					aria-label="Underlay map"
					value={underlay}
					onChange={(e) => setUnderlay(e.target.value)}
					className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-[12px] dark:border-neutral-600 dark:bg-neutral-900"
				>
					{UNDERLAYS.map((u) => (
						<option key={u.value} value={u.value}>
							{u.label}
						</option>
					))}
				</select>
				{underlay && (
					<label className="mt-1.5 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-300">
						opacity
						<input
							type="range"
							min={0}
							max={100}
							value={Math.round(opacity * 100)}
							aria-label="Underlay opacity"
							className="flex-1"
							onChange={(e) => setOpacity(Number(e.target.value) / 100)}
						/>
					</label>
				)}
			</div>
		</section>
	);
}
