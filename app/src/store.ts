import { create } from 'zustand';
import { ZONE_ORDER } from './constants';
import type { ZoneCode } from './types';

type Panel = 'none' | 'info' | 'districts';

interface AppState {
	activeZones: Set<ZoneCode>;
	toggleZone: (z: ZoneCode) => void;
	setAllZones: (active: boolean) => void;

	selectedPin: string | null;
	setSelectedPin: (pin: string | null) => void;

	underlay: string;
	underlayOpacity: number;
	setUnderlay: (u: string) => void;
	setUnderlayOpacity: (n: number) => void;

	panel: Panel;
	setPanel: (p: Panel) => void;
}

export const useStore = create<AppState>((set) => ({
	activeZones: new Set(ZONE_ORDER),
	toggleZone: (z) =>
		set((s) => {
			const next = new Set(s.activeZones);
			if (next.has(z)) {
				next.delete(z);
			} else {
				next.add(z);
			}
			return { activeZones: next };
		}),
	setAllZones: (active) =>
		set({ activeZones: active ? new Set(ZONE_ORDER) : new Set<ZoneCode>() }),

	selectedPin: null,
	setSelectedPin: (pin) => set({ selectedPin: pin }),

	underlay: '',
	underlayOpacity: 0.8,
	setUnderlay: (u) => set({ underlay: u }),
	setUnderlayOpacity: (n) => set({ underlayOpacity: n }),

	panel: 'none',
	setPanel: (p) => set((s) => ({ panel: s.panel === p ? 'none' : p })),
}));
