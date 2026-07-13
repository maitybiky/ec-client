import axios from 'axios';

/**
 * Detect the user's address from browser geolocation +
 * OpenStreetMap Nominatim reverse geocoding (free, no API key).
 * Returns partial address fields — name/phone still need manual entry.
 */
export async function detectAddress() {
  const position = await new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, () => {
      reject(new Error('Location permission denied'));
    }, { timeout: 10_000 });
  });

  const { latitude, longitude } = position.coords;
  const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
    params: { format: 'jsonv2', lat: latitude, lon: longitude },
    headers: { 'Accept-Language': 'en' },
  });

  const a = res.data.address ?? {};
  const line1 = [a.house_number, a.road, a.neighbourhood, a.suburb]
    .filter(Boolean)
    .join(', ');

  return {
    line1: line1 || res.data.display_name?.split(',').slice(0, 3).join(',') || '',
    city: a.city ?? a.town ?? a.village ?? a.county ?? '',
    state: a.state ?? '',
    postalCode: a.postcode ?? '',
  };
}
