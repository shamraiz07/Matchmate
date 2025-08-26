// src/services/trips.ts
import { api, upload } from './https';
import { stripUndefined } from '../utils/json';

export const TRIP_STATUSES = ['pending','approved','active','completed','cancelled'] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];
export type ID = number | string;

export type Trip = {
  fisherman_id?: number;
  trip_name: string;
  boat_id: number | null;
  departure_port: string | null;
  destination_port: string | null;
  status: TripStatus;
  departure_date?: string | null;
  expected_return_date?: string | null;
  actual_return_date?: string | null;
  crew_size?: number | null;
  fishing_method?: string | null;
  target_species?: string | null;
  estimated_catch?: number | null;
  fuel_cost?: number | null;
  crew_cost?: number | null;
  equipment_cost?: number | null;
  other_costs?: number | null;
  notes?: string | null;
};

export type TripDetails = {
  id: number | string;
  trip_name: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  fisherman?: { id: number; name: string } | null;
  boat_registration_no?: string | null;
  trip_type?: string | null;
  boat_name?: string | null;

  fishing_zone?: string | null;
  departure_port?: string | null;
  port_location?: string | null;
  departure_time?: string | null;
  departure_lat?: number | string | null;
  departure_lng?: number | string | null;

  crew_count?: number | null;
  emergency_phone?: string | null;
  emergency_contact?: string | null;
  safety_equipment?: string | null;
  weather?: string | null;
  sea_conditions?: string | null;
  wind_speed?: string | null;
  wave_height?: string | null;
  trip_purpose?: string | null;
  target_species?: string | null;
  estimated_catch?: number | null;
  fuel_cost?: number | null;
  operational_cost?: number | null;
  total_cost?: number | null;

  notes?: string | null;

  lots?: Array<{ id: number | string; lot_no: string; status: string }>;
};

export type ServerTripDTO = {
  id: number | string;
  trip_id: string;
  fisherman_id: number;
  user_id: number;
  boat_registration_number: string | null;
  boat_name: string | null;
  trip_type: string | null;
  fishing_zone: string | null;
  port_location: string | null;
  departure_port: string | null;
  departure_time: string | null;
  departure_latitude: string | null;
  departure_longitude: string | null;
  arrival_time: string | null;
  arrival_latitude: string | null;
  arrival_longitude: string | null;
  arrival_port: string | null;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  crew_count: number | null;
  safety_equipment: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  weather_conditions: string | null;
  sea_conditions: string | null;
  wind_speed: string | null | number;
  wave_height: string | null | number;
  estimated_catch_weight: number | null;
  target_species: string | null;
  fuel_cost: number | string | null;
  operational_cost: number | string | null;
  total_cost: number | string | null;
  notes?: string | null;
  status_label?: string | null;
  trip_type_label?: string | null;
  trip_purpose: string | null;
  fish_lots?: Array<{ id: number | string; lot_no: string; status: string }>;
  user?: { id: number; name: string } | null;
};

export function adaptTrip(dto: ServerTripDTO): TripDetails {
  return {
    id: dto.id,
    trip_name: dto.trip_id ?? `Trip ${dto.id}`,
    status: dto.status,
    fisherman: dto.user ? { id: dto.user.id, name: dto.user.name } : null,
    boat_registration_no: dto.boat_registration_number ?? null,
    boat_name: dto.boat_name ?? null,
    trip_type: dto.trip_type_label ?? dto.trip_type ?? null,

    fishing_zone: dto.fishing_zone ?? null,
    port_location: dto.port_location ?? null,
    departure_port: dto.departure_port ?? null,
    departure_time: toDisplay12h(dto.departure_time),
    departure_lat: dto.departure_latitude,
    departure_lng: dto.departure_longitude,

    crew_count: dto.crew_count ?? null,
    emergency_phone: dto.emergency_phone ?? null,
    emergency_contact: dto.emergency_contact ?? null,
    safety_equipment: dto.safety_equipment ?? null,
    weather: dto.weather_conditions ?? null,
    sea_conditions: dto.sea_conditions ?? null,
    wind_speed: (dto.wind_speed as any) ?? null,
    wave_height: (dto.wave_height as any) ?? null,

    target_species: dto.target_species ?? null,
    estimated_catch: dto.estimated_catch_weight ?? null,
    fuel_cost: dto.fuel_cost != null ? Number(dto.fuel_cost) : null,
    operational_cost: dto.operational_cost != null ? Number(dto.operational_cost) : null,
    total_cost: dto.total_cost != null ? Number(dto.total_cost) : null,

    notes: dto.trip_purpose ?? null,
    lots: undefined,
  };
}

export type TripCounts = {
  all: number;
  pending: number;
  approved: number;
  active: number;
  completed: number;
  cancelled: number;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

/** Create payload: expanded with new required fields */
export type CreateTripBody = {
  // identity
  trip_name: string;
  trip_id?: string;

  // associations
  fisherman_id: number;
  boat_registration_number: string;

  // enums
  trip_type: string; // 'fishing' | 'transport' | ...

  // captain / crew
  captain_name: string;
  captain_mobile_no: string;
  crew_no: number;
  crew_count: number;

  // admin
  port_clearance_no: string;
  fuel_quantity: number;
  ice_quantity: number;

  // ports / routing
  departure_site: string;
  departure_port: string;
  destination_port: string;
  port_location: string;

  // timing & coords
  departure_date: string; // YYYY-MM-DD
  departure_time: string; // "YYYY-MM-DD hh:mm AM/PM"
  departure_latitude?: number;
  departure_longitude?: number;

  // optional
  fishing_method?: string;
  target_species?: string;
  sea_type?: string;
  sea_conditions?: string;
  emergency_contact?: string;

  trip_cost?: number;
  fuel_cost?: number;
  estimated_catch?: number;
  equipment_cost?: number;
  notes?: string;
};

function readTotal(p: any): number {
  if (typeof p?.total === 'number') return p.total;
  if (typeof p?.data?.total === 'number') return p.data.total;
  if (Array.isArray(p?.data?.data)) return p.data.data.length;
  if (Array.isArray(p?.data)) return p.data.length;
  return 0;
}

export type UpdateTripBody = Partial<CreateTripBody>;

export type CompleteTripBody = {
  actual_return_date: string; // YYYY-MM-DD
  actual_catch?: number;
  final_fuel_cost?: number;
  final_crew_cost?: number;
  final_equipment_cost?: number;
  final_other_costs?: number;
  completion_notes?: string;
};

export type CancelTripBody = { cancellation_reason: string };
export type UpdateLocationBody = {
  current_latitude: number;
  current_longitude: number;
  current_location?: string;
};

export type TripStats = Record<string, any>;
export type ListParams = {
  page?: number;
  per_page?: number;
  status?: TripStatus;
  search?: string;
};

function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

/* =========================
 * List / Get / Create / Update / Delete
 * ========================= */

export async function listTrips(params?: ListParams) {
  const json = await api('/trips', { query: params });
  return unwrap<Paginated<Trip>>(json);
}

export async function getTrip(id: ID) {
  const json = await api(`/trips/${id}`);
  return unwrap<Trip>(json);
}

export async function createTrip(body: CreateTripBody) {
  const clean = stripUndefined(body);
  console.log('[createTrip] sending payload:', clean);

  try {
    const json = await api('/trips', { method: 'POST', body: clean });
    console.log('[createTrip] raw response:', json);

    // Backend returns { success, message, trip: {...} }
    if (json?.trip) return json.trip;

    const unwrapped = unwrap<Trip>(json);
    console.log('[createTrip] unwrapped response:', unwrapped);
    return unwrapped;
  } catch (err: any) {
    console.error('[createTrip] error:', err?.response || err);
    throw err;
  }
}

export async function updateTrip(id: ID, body: UpdateTripBody) {
  const json = await api(`/trips/${id}`, { method: 'PUT', body });
  return unwrap<Trip>(json);
}

export async function startTrip(id: ID) {
  const json = await api(`/trips/${id}/start-trip`, { method: 'POST' });
  return (json?.data ?? json) as Trip;
}

export async function cancelTrip(id: ID, body: { cancellation_reason: string }) {
  const json = await api(`/trips/${id}/cancel`, { method: 'POST', body });
  return (json?.data ?? json) as Trip;
}

export type CompleteTripPayload = {
  arrival_port: string;
  arrival_notes?: string;
  estimated_catch_weight?: number;
  catch_notes?: string;
  revenue?: number;
  arrival_latitude?: number;
  arrival_longitude?: number;
};
export async function completeTrip(id: ID, body: CompleteTripPayload) {
  const json = await api(`/trips/${id}/complete`, { method: 'POST', body });
  return (json?.data ?? json) as Trip;
}

export async function getTripById(id: number | string) {
  const json = await api(`/trips/${id}`, { method: 'GET' });
  const dto: ServerTripDTO = json?.data ?? json;
  return adaptTrip(dto);
}

export async function deleteTrip(id: number | string) {
  await api(`/trips/${id}`, { method: 'DELETE' });
}

/* =========================
 * State transitions
 * ========================= */

export async function approveTrip(id: ID) {
  const json = await api(`/trips/${id}/approve`, { method: 'POST' });
  return unwrap<Trip>(json);
}

/* =========================
 * Location & Media
 * ========================= */

export async function updateTripLocation(id: ID, body: UpdateLocationBody) {
  const json = await api(`/trips/${id}/update-location`, {
    method: 'POST',
    body,
  });
  return unwrap<Trip>(json);
}

export async function uploadTripPhoto(
  id: ID,
  file: { uri: string; name?: string; type?: string },
  caption?: string,
) {
  const form = new FormData();
  form.append('photo', {
    uri: file.uri,
    name: file.name ?? 'trip.jpg',
    type: file.type ?? 'image/jpeg',
  } as any);
  if (caption) form.append('caption', caption);

  const json = await upload(`/trips/${id}/upload-photo`, form);
  return unwrap<{ url?: string; [k: string]: any }>(json);
}

/* =========================
 * Stats / Filters / Search
 * ========================= */

export async function getTripStatistics(id: ID) {
  const json = await api(`/trips/${id}/statistics`);
  return unwrap<TripStats>(json);
}

export async function filterTripsByStatus(
  status: TripStatus,
  params?: { page?: number; per_page?: number },
) {
  const json = await api(`/trips/filter/status/${status}`, { query: params });
  return unwrap<Paginated<Trip>>(json);
}

export type SearchTripsParams = {
  q?: string;
  status?: TripStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export async function searchTrips(params: SearchTripsParams) {
  const json = await api('/trips/search', { query: params });
  return unwrap<Paginated<Trip>>(json);
}

export async function getTripCounts(): Promise<{
  totals: {
    all: number; pending: number; approved: number; active: number; completed: number; cancelled: number;
  };
  errors: Partial<Record<'all' | TripStatus, string>>;
}> {
  const statuses: TripStatus[] = ['pending','approved','active','completed','cancelled'];
  const reqs = [
    api('/trips', { query: { page: 1, per_page: 1 } }),
    ...statuses.map(status =>
      api('/trips', { query: { status, page: 1, per_page: 1 } }),
    ),
  ];

  const settled = await Promise.allSettled(reqs);

  const totals = { all: 0, pending: 0, approved: 0, active: 0, completed: 0, cancelled: 0 };
  const errors: Partial<Record<'all' | TripStatus, string>> = {};

  const allRes = settled[0];
  if (allRes.status === 'fulfilled') totals.all = readTotal(allRes.value);
  else { totals.all = 0; errors.all = (allRes as any).reason?.message || 'Failed'; }

  statuses.forEach((status, i) => {
    const res = settled[i + 1];
    if (res.status === 'fulfilled') totals[status] = readTotal(res.value);
    else { totals[status] = 0; errors[status] = (res as any).reason?.message || 'Failed'; }
  });

  return { totals, errors };
}

export type TripRowDTO = {
  id: number | string;
  trip_name: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  departure_port?: string | null;
  destination_port?: string | null;
  departure_time?: string | null;
};

function pad(n: number) { return String(n).padStart(2, '0'); }
function toDisplay12h(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  const hh = pad(h);
  return `${yyyy}-${mm}-${dd} ${hh}:${m} ${ap}`;
}

export async function listTripsPage(params?: { page?: number; per_page?: number; }) {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 25;

  const json = await api('/trips', { query: { page, per_page } });

  const arr: any[] = Array.isArray(json?.data?.data)
    ? json.data.data
    : Array.isArray(json?.data)
    ? json.data
    : [];

  const rows: TripRowDTO[] = arr.map((t: any) => ({
    id: t.id ?? t.trip_id,
    trip_name: t.trip_name ?? t.trip_id ?? `Trip ${t.id ?? ''}`,
    status: (t.status ?? 'pending') as TripRowDTO['status'],
    departure_port: t.departure_port ?? t.port_location ?? null,
    destination_port: t.destination_port ?? null,
    departure_time: toDisplay12h(t.departure_time),
  }));

  const total = Number(json?.data?.total ?? rows.length);
  const last_page = Number(json?.data?.last_page ?? 1);

  return { rows, total, last_page, raw: json };
}

/** List rows helper */
export type TripListRow = {
  id: number | string;
  trip_name: string;
  status: TripStatus;
  departure_port: string | null;
  destination_port: string | null;
  departure_time: string | null;
};

export type LoadTripRowsParams = {
  page?: number;
  per_page?: number;
  status?: TripStatus;
  search?: string;
  signal?: AbortSignal;
};

export async function loadTripRows(params?: LoadTripRowsParams) {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 25;

  const res = await api('/trips', {
    query: {
      page,
      per_page,
      status: params?.status,
      search: params?.search,
    },
    signal: params?.signal,
  });

  const arr: any[] = Array.isArray(res?.data?.data)
    ? res.data.data
    : Array.isArray(res?.data)
    ? res.data
    : [];

  const rows: TripListRow[] = arr.map((t: any) => ({
    id: t?.id ?? t?.trip_id,
    trip_name: t?.trip_name ?? t?.trip_id ?? `Trip ${t?.id ?? ''}`,
    status: (t?.status ?? 'pending') as TripStatus,
    departure_port: t?.departure_port ?? t?.port_location ?? null,
    destination_port: t?.arrival_port ?? t?.destination_port ?? null,
    departure_time: toDisplay12h(t?.departure_time),
  }));

  rows.sort((a, b) => Number(b.id) - Number(a.id));

  const total = Number(res?.data?.total ?? rows.length);
  const last_page = Number(res?.data?.last_page ?? 1);

  return { rows, total, last_page };
}
