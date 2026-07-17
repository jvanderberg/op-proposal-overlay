import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ZONE_ORDER } from '../constants';
import { useStore } from '../store';
import type { SearchEntry } from '../types';
import { SearchInput } from './SearchInput';

const ENTRIES: SearchEntry[] = [
	{
		pin: '12345678900000',
		address: '123 Lake Street',
		zone: 'N-2',
		center: [-87.79, 41.88],
	},
];

describe('SearchInput', () => {
	beforeEach(() => {
		useStore.setState({
			activeZones: new Set(ZONE_ORDER),
			selectedPin: null,
			panel: 'none',
		});
	});

	afterEach(cleanup);

	it('selects a parcel by address', async () => {
		const user = userEvent.setup();
		render(<SearchInput entries={ENTRIES} />);
		const input = screen.getByRole('textbox', { name: /search address/i });

		await user.type(input, 'lake');
		expect(document.activeElement).toBe(input);
		await user.click(screen.getByRole('button', { name: /123 Lake Street/i }));

		expect(useStore.getState().selectedPin).toBe('12345678900000');
		expect(document.activeElement).not.toBe(input);
		expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
			'123 Lake Street',
		);
	});
});
