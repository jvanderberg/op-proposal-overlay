import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ZONE_ORDER } from '../constants';
import { useStore } from '../store';
import type { ZoneCode } from '../types';
import { Legend } from './Legend';

describe('Legend', () => {
	beforeEach(() => {
		useStore.setState({
			activeZones: new Set(ZONE_ORDER),
			underlay: '',
			underlayOpacity: 0.8,
			panel: 'none',
		});
	});

	afterEach(cleanup);

	it('toggles a proposed district', async () => {
		const counts = { 'N-1': 12 } as Record<ZoneCode, number>;
		const user = userEvent.setup();
		render(<Legend counts={counts} />);

		const district = screen.getByRole('button', {
			name: /N-1 Neighborhood 1/i,
		});
		expect(district.getAttribute('aria-pressed')).toBe('true');
		await user.click(district);
		expect(district.getAttribute('aria-pressed')).toBe('false');
		expect(useStore.getState().activeZones.has('N-1')).toBe(false);
	});
});
