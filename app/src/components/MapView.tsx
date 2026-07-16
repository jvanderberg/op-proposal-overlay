import {
	ImageOverlay,
	MapContainer,
	Pane,
	TileLayer,
	ZoomControl,
} from 'react-leaflet';
import { CARTO_DARK, CARTO_LIGHT, OVERLAY_BOUNDS } from '../constants';
import { useStore } from '../store';
import type { ParcelCollection } from '../types';
import { ParcelLayer } from './ParcelLayer';

const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

export function MapView({ data }: { data: ParcelCollection | null }) {
	const underlay = useStore((s) => s.underlay);
	const opacity = useStore((s) => s.underlayOpacity);

	return (
		<MapContainer
			center={[41.888, -87.789]}
			zoom={14}
			minZoom={12}
			zoomControl={false}
			preferCanvas
			className="absolute inset-0 h-full w-full"
		>
			<TileLayer
				url={isDark ? CARTO_DARK : CARTO_LIGHT}
				subdomains="abcd"
				attribution="&copy; OpenStreetMap, &copy; CARTO"
				maxZoom={20}
			/>
			<Pane name="opticos" style={{ zIndex: 450, pointerEvents: 'none' }}>
				{underlay && (
					<ImageOverlay
						url={`${import.meta.env.BASE_URL}${underlay}`}
						bounds={OVERLAY_BOUNDS}
						opacity={opacity}
					/>
				)}
			</Pane>
			<ZoomControl position="bottomright" />
			{data && <ParcelLayer data={data} isDark={isDark} />}
		</MapContainer>
	);
}
