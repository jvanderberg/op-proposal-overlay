import { PanelLeftClose, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { SearchEntry, ZoneCode } from '../types';
import { Legend } from './Legend';
import { TitleCard } from './TitleCard';

interface Props {
	searchEntries: SearchEntry[];
	counts: Record<ZoneCode, number>;
	total: number;
	error: string | null;
}

function initiallyOpen() {
	if (
		typeof window === 'undefined' ||
		typeof window.matchMedia !== 'function'
	) {
		return true;
	}
	return !window.matchMedia('(max-width: 640px)').matches;
}

export function MapControls({ searchEntries, counts, total, error }: Props) {
	const [open, setOpen] = useState(initiallyOpen);
	const selectedPin = useStore((state) => state.selectedPin);

	useEffect(() => {
		if (selectedPin && window.matchMedia('(max-width: 640px)').matches) {
			setOpen(false);
		}
	}, [selectedPin]);

	if (!open) {
		return (
			<button
				type="button"
				aria-label="Open map controls"
				onClick={() => setOpen(true)}
				className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-[10px] border border-neutral-200 bg-white/95 px-3 py-2 text-[12px] font-medium shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95"
			>
				<SlidersHorizontal size={15} />
				Open map controls
			</button>
		);
	}

	return (
		<aside className="absolute top-3 left-3 z-[1000] flex max-h-[calc(100dvh-24px)] w-[350px] max-w-[calc(100vw-64px)] flex-col overflow-hidden rounded-[10px] border border-neutral-200 bg-white/95 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
			<button
				type="button"
				aria-label="Close map controls"
				onClick={() => setOpen(false)}
				className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-1.5 py-1 text-[11px] text-neutral-600 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
			>
				<PanelLeftClose size={14} />
				Hide
			</button>
			<div className="min-h-0 overflow-y-auto">
				<TitleCard searchEntries={searchEntries} total={total} error={error} />
				<Legend counts={counts} />
			</div>
		</aside>
	);
}
