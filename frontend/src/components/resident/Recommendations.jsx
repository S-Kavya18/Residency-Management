import { useMemo, useState } from 'react';
import { FiMapPin, FiNavigation2 } from 'react-icons/fi';

// Residency coordinates (approx): 8.49534338756602, 78.12509223816596
const RESIDENCY_COORD = { lat: 8.49534338756602, lng: 78.12509223816596 };

const places = [
  {
    name: 'Beachfront Promenade',
    category: 'outdoors',
    description: 'Sunset walk spot; great for evening jogs and sea breeze.',
    maps: 'https://maps.google.com/?q=Tiruchendur+Beach',
    lat: 8.4945,
    lng: 78.1255
  },
  {
    name: 'Temple Corridor (Murugan)',
    category: 'culture',
    description: 'Historic temple corridor; calm mornings, vibrant evenings.',
    maps: 'https://maps.google.com/?q=Tiruchendur+Murugan+Temple',
    lat: 8.4975,
    lng: 78.1208
  },
  {
    name: 'Local Coffee & Tiffin',
    category: 'food',
    description: 'Idli, dosa, and filter coffee—fast, budget-friendly breakfast.',
    maps: 'https://maps.google.com/?q=Tiruchendur+breakfast',
    lat: 8.4965,
    lng: 78.1235
  },
  {
    name: 'Vegetarian Mess',
    category: 'food',
    description: 'Simple South Indian meals; good for daily lunch or dinner.',
    maps: 'https://maps.google.com/?q=Tiruchendur+veg+meals',
    lat: 8.4961,
    lng: 78.1244
  },
  {
    name: 'Pharmacy & Clinic Strip',
    category: 'essentials',
    description: 'Row of pharmacies and a walk-in clinic for quick needs.',
    maps: 'https://maps.google.com/?q=Tiruchendur+pharmacy',
    lat: 8.4958,
    lng: 78.1238
  },
  {
    name: 'Groceries & Staples',
    category: 'essentials',
    description: 'Fresh produce and daily essentials; open early to late.',
    maps: 'https://maps.google.com/?q=Tiruchendur+grocery',
    lat: 8.4959,
    lng: 78.1245
  },
  {
    name: 'Seafood Street',
    category: 'food',
    description: 'Evening-only fresh catch; grilled and fried options.',
    maps: 'https://maps.google.com/?q=Tiruchendur+seafood',
    lat: 8.494,
    lng: 78.1265
  },
  {
    name: 'Bus Stand & Autos',
    category: 'transport',
    description: 'Quick auto access and buses for nearby towns.',
    maps: 'https://maps.google.com/?q=Tiruchendur+bus+stand',
    lat: 8.498,
    lng: 78.1258
  }
];

const categoryLabels = {
  all: 'All',
  food: 'Food & Cafes',
  essentials: 'Essentials',
  culture: 'Culture',
  outdoors: 'Outdoors',
  transport: 'Transport'
};

const Recommendations = () => {
  const [category, setCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState('any');

  const directionsUrl = (place) =>
    `https://www.google.com/maps/dir/?api=1&origin=${RESIDENCY_COORD.lat},${RESIDENCY_COORD.lng}&destination=${place.lat},${place.lng}&travelmode=walking`;

  const filtered = useMemo(() => {
    const haversine = (lat1, lon1, lat2, lon2) => {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return places
      .map((p) => ({
        ...p,
        distanceKm: Number(haversine(RESIDENCY_COORD.lat, RESIDENCY_COORD.lng, p.lat, p.lng).toFixed(2))
      }))
      .filter((p) => (category === 'all' ? true : p.category === category))
      .filter((p) => (maxDistance === 'any' ? true : p.distanceKm <= Number(maxDistance)))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [category, maxDistance]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nearby Recommendations</h1>
          <p className="text-sm text-gray-600">Curated spots around RSM Lakshmini Residency (lat 8.49534, lng 78.12509) for food, errands, and relaxation.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="any">Any distance</option>
            <option value="0.5">Within 0.5 km</option>
            <option value="1">Within 1 km</option>
            <option value="1.5">Within 1.5 km</option>
            <option value="2">Within 2 km</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place) => (
          <div key={place.name} className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{categoryLabels[place.category] || place.category}</p>
              </div>
              <span className="text-sm font-semibold text-indigo-700">{place.distanceKm} km</span>
            </div>
            <p className="text-sm text-gray-700 mt-2">{place.description}</p>
            <div className="mt-3 flex gap-2">
              <a
                href={directionsUrl(place)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-indigo-700 font-semibold hover:text-indigo-800"
              >
                <FiNavigation2 /> Navigate
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 text-sm text-gray-600">No places match this filter. Try widening the distance or another category.</div>
      )}
    </div>
  );
};

export default Recommendations;