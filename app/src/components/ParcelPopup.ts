import { DISTRICTS } from '../constants';
import type { ParcelProps } from '../types';
import { changesFor } from '../zoningChanges';

const PROPOSAL_URL = 'https://engageoakpark.com/shape/documents';

export function popupContent(parcel: ParcelProps): HTMLElement {
	const district = DISTRICTS[parcel.proposed_zone];
	const changes = changesFor(parcel.existing_zone);
	const textColor =
		parcel.proposed_zone === 'N-1' || parcel.proposed_zone === 'DT-3'
			? '#333'
			: '#fff';
	const root = document.createElement('div');

	const heading = document.createElement('div');
	heading.className = 'parcel-popup-heading';
	const badge = document.createElement('span');
	badge.textContent = parcel.proposed_zone;
	Object.assign(badge.style, {
		display: 'inline-block',
		padding: '1px 7px',
		borderRadius: '999px',
		fontWeight: '600',
		fontSize: '11px',
		background: district.color,
		color: textColor,
	});
	const districtName = document.createElement('strong');
	districtName.textContent = district.name;
	heading.append(badge, districtName);

	const conversion = document.createElement('div');
	conversion.className = 'parcel-popup-conversion';
	const existing = document.createElement('b');
	existing.textContent = parcel.existing_zone;
	const proposed = document.createElement('b');
	proposed.textContent = parcel.proposed_zone;
	conversion.append(existing, ' → ', proposed);

	const details = document.createElement('details');
	details.className = 'parcel-popup-changes';
	const summary = document.createElement('summary');
	summary.textContent = 'What would change';
	const table = document.createElement('dl');
	table.className = 'parcel-popup-change-list';
	for (const row of changes.rows) {
		const term = document.createElement('dt');
		term.textContent = row.label;
		const comparison = document.createElement('dd');
		const before = document.createElement('span');
		before.textContent = row.before;
		const arrow = document.createElement('span');
		arrow.className = 'parcel-popup-arrow';
		arrow.textContent = '→';
		const after = document.createElement('strong');
		after.textContent = row.after;
		comparison.append(before, arrow, after);
		table.append(term, comparison);
	}

	const villagewide = document.createElement('p');
	villagewide.className = 'parcel-popup-villagewide';
	villagewide.textContent =
		'Villagewide: remove parking minimums and expand ADU options.';

	const note = document.createElement('p');
	note.className = 'parcel-popup-note';
	note.textContent = changes.note ?? '';

	const proposal = document.createElement('a');
	proposal.href = PROPOSAL_URL;
	proposal.target = '_blank';
	proposal.rel = 'noopener noreferrer';
	proposal.textContent = 'Read the Opticos recommendation ↗';

	details.append(summary, table, villagewide);
	if (changes.note) details.append(note);
	details.append(proposal);

	const rule = document.createElement('hr');
	rule.style.cssText =
		'border:none;border-top:1px solid rgba(128,128,128,.3);margin:7px 0';
	const address = document.createElement('strong');
	address.textContent = parcel.address || '—';
	const description = document.createElement('span');
	description.style.opacity = '0.7';
	description.textContent = parcel.description ?? '';
	const assessor = document.createElement('a');
	assessor.href = `https://www.cookcountyassessor.com/pin/${encodeURIComponent(parcel.pin)}`;
	assessor.target = '_blank';
	assessor.rel = 'noopener noreferrer';
	assessor.textContent = 'Assessor record ↗';

	root.append(
		heading,
		conversion,
		details,
		rule,
		address,
		document.createElement('br'),
		`PIN ${parcel.pin} · class ${parcel.class}`,
		document.createElement('br'),
		description,
		document.createElement('br'),
		assessor,
	);
	return root;
}
