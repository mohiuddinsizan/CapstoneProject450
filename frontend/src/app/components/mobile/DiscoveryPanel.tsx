import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { Location, Locker } from '@/lib/types';

interface DiscoveryPanelProps {
  lockers: Locker[];
  locations: Location[];
  selectedLockerId: string;
  selectedLocationId: string;
  onSelectLocker: (lockerId: string) => void;
  onSelectLocation: (locationId: string) => void;
  onRefresh: () => void;
}

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getLocationAnchor(locationName?: string | null) {
  const name = (locationName || '').toLowerCase();

  if (name.includes('science')) return { lat: 23.7292, lng: 90.3987 };
  if (name.includes('library')) return { lat: 23.7283, lng: 90.3968 };
  if (name.includes('union')) return { lat: 23.7271, lng: 90.3997 };
  if (name.includes('gym')) return { lat: 23.7301, lng: 90.4008 };
  if (name.includes('hall')) return { lat: 23.7313, lng: 90.3974 };

  return { lat: 23.7296, lng: 90.3991 };
}

function toCoordinate(value?: number | string | null) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getLocationCoordinates(location?: Location | null) {
  if (!location) return null;
  const lat = toCoordinate(location.latitude);
  const lng = toCoordinate(location.longitude);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function lockerToMapPoint(locker: Locker, locations: Location[]) {
  const lockerLat = toCoordinate(locker.latitude);
  const lockerLng = toCoordinate(locker.longitude);

  if (lockerLat !== null && lockerLng !== null) {
    return { lat: lockerLat, lng: lockerLng };
  }

  const matchedLocation = locations.find((location) => location.id === locker.location_id);
  const locationCoordinates = getLocationCoordinates(matchedLocation);
  const anchor = locationCoordinates || getLocationAnchor(locker.location_name);
  const hash = hashCode(locker.id);
  const latOffset = ((hash % 200) - 100) * 0.00002;
  const lngOffset = (((Math.floor(hash / 200) % 200) - 100) * 0.00002);
  return {
    lat: anchor.lat + latOffset,
    lng: anchor.lng + lngOffset
  };
}

function statusBadge(status: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-700';
  if (status === 'OCCUPIED') return 'bg-rose-100 text-rose-700';
  if (status === 'MAINTENANCE') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

function markerColor(status: string) {
  if (status === 'AVAILABLE') return '#10b981';
  if (status === 'OCCUPIED') return '#f43f5e';
  if (status === 'MAINTENANCE') return '#f59e0b';
  return '#64748b';
}

export function DiscoveryPanel({
  lockers,
  locations,
  selectedLockerId,
  selectedLocationId,
  onSelectLocker,
  onSelectLocation,
  onRefresh
}: DiscoveryPanelProps) {
  const selectedLocker = lockers.find((locker) => locker.id === selectedLockerId);
  const selectedLocation = locations.find((location) => location.id === selectedLocationId);
  const selectedLocationCoordinates = getLocationCoordinates(selectedLocation);
  const firstKnownLocation = locations.map((location) => getLocationCoordinates(location)).find((point) => Boolean(point));
  const mapCenter = selectedLocker
    ? lockerToMapPoint(selectedLocker, locations)
    : lockers.length > 0
      ? lockerToMapPoint(lockers[0], locations)
      : selectedLocationCoordinates || firstKnownLocation || { lat: 23.7296, lng: 90.3991 };

  return (
    <div className="lg:col-span-2 bg-white/95 backdrop-blur rounded-3xl border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="p-4 border-b border-slate-100/90 bg-gradient-to-r from-slate-50 to-white flex flex-wrap gap-2 items-center justify-between">
        <h2 className="font-bold text-slate-900">Locker Discovery (Map)</h2>
        <div className="flex items-center gap-2">
          <select
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            value={selectedLocationId}
            onChange={(e) => onSelectLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <button className="text-sm px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium transition-colors" onClick={onRefresh}>
            Sync
          </button>
        </div>
      </div>
      <div className="h-72 md:h-96">
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={16} scrollWheelZoom className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

          {lockers.map((locker) => {
            const point = lockerToMapPoint(locker, locations);
            return (
              <CircleMarker
                key={locker.id}
                center={[point.lat, point.lng]}
                radius={selectedLockerId === locker.id ? 10 : 7}
                pathOptions={{ color: markerColor(locker.status), fillOpacity: 0.85 }}
                eventHandlers={{ click: () => onSelectLocker(locker.id) }}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{locker.locker_name}</p>
                    <p className="text-xs">{locker.location_name || 'Unknown location'}</p>
                    <p className="text-xs">Status: {locker.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="p-4 border-t border-slate-100 overflow-auto max-h-48 bg-white">
        <div className="grid sm:grid-cols-2 gap-3">
          {lockers.map((locker) => (
            <button
              key={locker.id}
              onClick={() => onSelectLocker(locker.id)}
              className={`text-left p-3 rounded-xl border bg-white transition-all ${selectedLockerId === locker.id ? 'ring-2 ring-blue-500 border-blue-200 shadow-md shadow-blue-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold truncate">{locker.locker_name}</p>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusBadge(locker.status)}`}>
                  {locker.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">{locker.location_name || 'Unknown location'}</p>
              <p className="text-[11px] text-slate-400 mt-1">{locker.id}</p>
            </button>
          ))}
          {lockers.length === 0 && (
            <div className="text-sm text-slate-500 col-span-2 border border-dashed border-slate-200 rounded-xl p-4 text-center">
              No lockers found for selected location filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
