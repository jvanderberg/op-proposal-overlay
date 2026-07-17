import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileParcelPopup } from './MobileParcelPopup';

describe('MobileParcelPopup', () => {
	afterEach(cleanup);

	it('renders outside MapLibre and closes from its fixed shell', async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(
			<MobileParcelPopup
				parcel={{
					pin: '16184080040000',
					address: '1010 S EUCLID AVE',
					class: '206',
					description: 'Residence',
					existing_zone: 'R-4',
					proposed_zone: 'N-2',
				}}
				onClose={onClose}
			/>,
		);

		expect(screen.getByRole('dialog').textContent).toContain(
			'1010 S EUCLID AVE',
		);
		await user.click(screen.getByRole('button', { name: 'Close popup' }));
		expect(onClose).toHaveBeenCalledOnce();
	});
});
