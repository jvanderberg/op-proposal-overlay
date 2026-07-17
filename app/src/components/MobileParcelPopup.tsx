import { useEffect, useRef } from 'react';
import type { ParcelProps } from '../types';
import { popupContent } from './ParcelPopup';

interface Props {
	parcel: ParcelProps;
	onClose: () => void;
}

export function MobileParcelPopup({ parcel, onClose }: Props) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = popupContent(parcel);
		contentRef.current?.append(root);
		return () => root.remove();
	}, [parcel]);

	return (
		<div
			className="parcel-mobile-popup"
			role="dialog"
			aria-label={`Parcel details for ${parcel.address || parcel.pin}`}
		>
			<div
				ref={contentRef}
				className="maplibregl-popup-content parcel-mobile-popup-content"
			>
				<button
					type="button"
					aria-label="Close popup"
					onClick={onClose}
					className="maplibregl-popup-close-button"
				>
					×
				</button>
			</div>
		</div>
	);
}
