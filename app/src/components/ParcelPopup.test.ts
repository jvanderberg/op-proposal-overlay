import { describe, expect, it } from 'vitest';
import { popupContent } from './ParcelPopup';

describe('popupContent', () => {
	it('renders parcel fields as text and constructs a trusted assessor URL', () => {
		const content = popupContent({
			pin: '12345678900000',
			address: '<img src=x onerror=alert(1)>',
			class: '203',
			description: '<script>alert(1)</script>',
			existing_zone: 'R-2',
			proposed_zone: 'N-2',
		});

		expect(content.querySelector('img')).toBeNull();
		expect(content.querySelector('script')).toBeNull();
		expect(content.textContent).toContain('<img src=x onerror=alert(1)>');
		expect(content.querySelector('a')?.href).toBe(
			'https://engageoakpark.com/shape/documents',
		);
		expect(content.querySelectorAll('a')[1]?.href).toBe(
			'https://www.cookcountyassessor.com/pin/12345678900000',
		);
	});

	it('compares the source district with the proposal and qualifies six units', () => {
		const content = popupContent({
			pin: '12345678900000',
			address: '1000 Forest Ave',
			class: '205',
			existing_zone: 'R-2',
			proposed_zone: 'N-2',
		});

		expect(content.textContent).toContain('What would change');
		expect(content.textContent).toContain('6,200 sq ft');
		expect(content.textContent).toContain('None proposed');
		expect(content.textContent).toContain('30 / 35 ft');
		expect(content.textContent).toContain('20 / 25 ft');
		expect(content.textContent).toContain(
			'this map does not determine parcel eligibility',
		);
		expect(content.querySelector('details')?.open).toBe(false);
	});
});
