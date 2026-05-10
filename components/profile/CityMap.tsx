'use client';
import { useEffect, useRef } from 'react';

const CITY_COORDS: Record<string, [number, number]> = {
  'Cotonou':    [6.3654, 2.4183],
  'Porto-Novo': [6.4969, 2.6289],
  'Lomé':       [6.1375, 1.2123],
  'Abidjan':    [5.3600, -4.0083],
  'Dakar':      [14.6928, -17.4467],
  'Accra':      [5.6037, -0.1870],
  'Lagos':      [6.5244, 3.3792],
  'Douala':     [4.0511, 9.7679],
};

interface Props {
  profiles: any[];
  selectedCity: string;
  onCityClick: (city: string) => void;
}

export default function CityMap({ profiles, selectedCity, onCityClick }: Props) {
  const mapRef = useRef<any>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Count profiles per city
  const cityCounts: Record<string, number> = {};
  profiles.forEach(p => {
    const city = p.city;
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstance.current) return;

    // Dynamically load Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = (window as any).L;
      const map = L.map(mapRef.current, {
        center: [6.5, 2.5],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      updateMarkers(L, map);
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const updateMarkers = (L: any, map: any) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    Object.entries(CITY_COORDS).forEach(([city, coords]) => {
      const count = cityCounts[city] || 0;
      const isSelected = city === selectedCity;
      const size = count > 0 ? Math.min(24 + count * 4, 52) : 20;

      const icon = L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${isSelected ? '#993556' : count > 0 ? '#D4537E' : '#e5c6d0'};
          border:2px solid white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:${count > 0 ? '11px' : '0'};font-weight:700;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);
          cursor:pointer;
          transition:transform 0.2s;
        ">${count > 0 ? count : ''}</div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(coords, { icon })
        .addTo(map)
        .bindTooltip(`<b>${city}</b>${count > 0 ? `<br>${count} profil${count > 1 ? 's' : ''}` : ''}`, { direction: 'top', offset: [0, -size / 2] })
        .on('click', () => onCityClick(city));

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapInstance.current) return;
    const L = (window as any).L;
    if (L) updateMarkers(L, mapInstance.current);
  }, [profiles, selectedCity]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '320px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {selectedCity && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur text-xs font-semibold text-brand-600 px-3 py-1.5 rounded-full border border-brand-200 shadow-sm">
          📍 {selectedCity} · {cityCounts[selectedCity] || 0} profil{(cityCounts[selectedCity] || 0) > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
