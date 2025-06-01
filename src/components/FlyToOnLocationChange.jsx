import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function FlyToOnLocationChange({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 15);
    }
  }, [coords, map]);

  return null;
}

