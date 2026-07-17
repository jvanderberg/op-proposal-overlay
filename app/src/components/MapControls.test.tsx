import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import type { ZoneCode } from '../types';
import { MapControls } from './MapControls';

describe('MapControls', () => {
	afterEach(cleanup);

	it('combines the search and legend in one collapsible panel', async () => {
		const user = userEvent.setup();
		render(
			<MapControls
				searchEntries={[]}
				counts={{ 'N-1': 12 } as Record<ZoneCode, number>}
				total={12}
				error={null}
			/>,
		);

		expect(
			screen.getByRole('textbox', { name: /search address/i }),
		).toBeTruthy();
		expect(screen.getByText('Districts')).toBeTruthy();

		await user.click(
			screen.getByRole('button', { name: 'Close map controls' }),
		);
		expect(screen.queryByText('Districts')).toBeNull();

		await user.click(screen.getByRole('button', { name: 'Open map controls' }));
		expect(screen.getByText('Districts')).toBeTruthy();
	});
});
