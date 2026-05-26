const DEFAULT_CITIES = [
  'Cotonou', 'Porto-Novo', 'Lomé', 'Abidjan', 'Dakar',
  'Accra', 'Lagos', 'Douala', 'Nairobi', 'Abuja',
  'Bamako', 'Ouagadougou', 'Niamey', 'Conakry', 'Libreville',
];

export function getCities(): string[] {
  if (typeof window === 'undefined') return DEFAULT_CITIES;
  try {
    const saved = localStorage.getItem('afrodite-custom-cities');
    const custom = saved ? JSON.parse(saved) : [];
    const all = [...DEFAULT_CITIES, ...custom];
    return [...new Set(all)].sort((a, b) => {
      // Villes par défaut en premier
      const aDefault = DEFAULT_CITIES.includes(a);
      const bDefault = DEFAULT_CITIES.includes(b);
      if (aDefault && !bDefault) return -1;
      if (!aDefault && bDefault) return 1;
      return a.localeCompare(b);
    });
  } catch {
    return DEFAULT_CITIES;
  }
}

export function addCity(city: string): void {
  if (!city || typeof window === 'undefined') return;
  const normalized = city.trim();
  if (DEFAULT_CITIES.includes(normalized)) return;
  try {
    const saved = localStorage.getItem('afrodite-custom-cities');
    const custom = saved ? JSON.parse(saved) : [];
    if (!custom.includes(normalized)) {
      custom.push(normalized);
      localStorage.setItem('afrodite-custom-cities', JSON.stringify(custom));
    }
  } catch {}
}

export const CITIES = DEFAULT_CITIES;
