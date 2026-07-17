import { X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import type { SearchEntry } from '../types';

export function SearchInput({ entries }: { entries: SearchEntry[] }) {
	const [text, setText] = useState('');
	const [open, setOpen] = useState(false);
	const [sel, setSel] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const setSelectedPin = useStore((s) => s.setSelectedPin);

	const q = text.trim().toLowerCase();
	const matches = useMemo(
		() =>
			q.length < 2
				? []
				: entries
						.filter(
							(m) => m.address.toLowerCase().includes(q) || m.pin.includes(q),
						)
						.slice(0, 8),
		[entries, q],
	);

	function choose(i: number) {
		const m = matches[i];
		if (!m) return;
		// Explicitly dismiss the iOS keyboard before the controls unmount. Without
		// this, Safari can keep the visual viewport panned to the removed input and
		// place the popup close button above the visible area.
		inputRef.current?.blur();
		setText(m.address || m.pin);
		setOpen(false);
		setSelectedPin(m.pin);
	}

	return (
		<div className="relative mt-2.5">
			<input
				ref={inputRef}
				type="text"
				value={text}
				placeholder="Search address or PIN…"
				aria-label="Search address or PIN"
				className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 pr-8 text-[16px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/15 sm:text-[13px] dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-400"
				onFocus={() => setOpen(true)}
				onChange={(e) => {
					setText(e.target.value);
					setSel(-1);
					setOpen(true);
				}}
				onBlur={() => setTimeout(() => setOpen(false), 120)}
				onKeyDown={(e) => {
					if (e.key === 'ArrowDown') {
						setSel((s) => Math.min(s + 1, matches.length - 1));
						e.preventDefault();
					} else if (e.key === 'ArrowUp') {
						setSel((s) => Math.max(s - 1, 0));
						e.preventDefault();
					} else if (e.key === 'Enter') {
						choose(sel < 0 ? 0 : sel);
					} else if (e.key === 'Escape') {
						setOpen(false);
					}
				}}
			/>
			{text && (
				<button
					type="button"
					aria-label="Clear search"
					className="-translate-y-1/2 absolute top-1/2 right-1.5 p-1 text-neutral-500 dark:text-neutral-300"
					onClick={() => {
						setText('');
						setOpen(false);
					}}
				>
					<X size={15} />
				</button>
			)}
			{open && matches.length > 0 && (
				<div className="absolute right-0 left-0 z-[1200] mt-1 max-h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white/95 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
					{matches.map((m, i) => (
						<button
							type="button"
							key={m.pin}
							className={`block w-full border-neutral-200 border-b px-2.5 py-1.5 text-left text-[12.5px] last:border-0 hover:bg-red-700/10 dark:border-neutral-700 ${i === sel ? 'bg-red-700/10' : ''}`}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => choose(i)}
						>
							{m.address || '(no address)'}
							<small className="block text-[11px] text-neutral-500 dark:text-neutral-300">
								PIN {m.pin} · {m.zone}
							</small>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
