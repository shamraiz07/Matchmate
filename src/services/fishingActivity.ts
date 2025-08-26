// src/services/fishingActivities.ts
import { api } from './https';

export type CreateFishingActivityBody = {
  trip_id: number | string;
  activity_number: number;            // 1..20
  time_of_netting: string | null;     // "HH:mm" 24h or null
  time_of_hauling: string | null;     // "HH:mm" 24h or null
  mesh_size: 1|2|3|4|5|6|7|8 | null;
  net_length: number | null;          // meters
  net_width: number | null;           // meters
  gps_latitude: number;               // -90..90
  gps_longitude: number;              // -180..180
};

export async function createFishingActivity(body: CreateFishingActivityBody) {
  // backend url: https://smartaisoft.com/MFD-Trace-Fish/api/fishing-activities
  // your api() helper already injects base URL / headers; if not, pass full URL.
  const json = await api('/fishing-activities', { method: 'POST', body });
  // backend usually returns { success, message, data } — unwrap as you prefer:
  return json?.data ?? json;
}



export type ActivityListParams = {
  page?: number;
  per_page?: number;
  q?: string;
  status?: string; // e.g. 'active','completed'
};

export type PaginatedActivities = {
  items: FishingActivity[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};


// If you need edit/update later:
export async function updateFishingActivity(id: number | string, body: Partial<FishingActivity>) {
  const json = await api(`/fishing-activities/${id}`, { method: 'PUT', body });
  return json?.data ?? json;
}

export type FishingActivity = {
  id: number | string;
  trip_id: number | string;
  trip_code?: string | null;     // e.g. "TRIP-20250825-008"
  fisherman_id?: number | string;
  activity_number: number;
  activity_time?: string | null; // ISO
  time_of_netting?: string | null;
  time_of_hauling?: string | null;
  gps_latitude?: string | number | null;
  gps_longitude?: string | number | null;
  mesh_size?: number | string | null;
  net_length?: number | string | null;
  net_width?: number | string | null;
  gear_type?: string | null;
  status?: 'active' | 'completed' | 'pending' | 'cancelled' | string;
};

export type ListFAParams = {
  page?: number;
  per_page?: number;
  q?: string;
  status?: 'active' | 'completed' | 'pending' | 'cancelled';
};

export async function listFishingActivities(params: ListFAParams = {}) {
  const json = await api('/fishing-activities/all/activities', { method: 'GET', query: params });

  // server may return {success, data: {data:[], ...}} or {data:[], ...}
  const envelope = json?.data ?? json;
  const dataArr: any[] = Array.isArray(envelope?.data) ? envelope.data
                    : Array.isArray(envelope?.data?.data) ? envelope.data.data
                    : Array.isArray(envelope) ? envelope
                    : [];

  return {
    items: dataArr as FishingActivity[],
    meta: {
      current_page: Number(envelope?.current_page ?? envelope?.data?.current_page ?? 1),
      per_page:     Number(envelope?.per_page ?? envelope?.data?.per_page ?? (dataArr?.length || 15)),
      // NOTE: wrap (||) when mixing with (??)
      total:        Number(envelope?.total ?? envelope?.data?.total ?? (dataArr?.length || 0)),
      last_page:    Number(envelope?.last_page ?? envelope?.data?.last_page ?? 1),
    },
  };
}

export async function completeFishingActivity(id: number | string) {
  const json = await api(`/fishing-activities/${id}/complete`, { method: 'POST' });
  return json?.data ?? json;
}
