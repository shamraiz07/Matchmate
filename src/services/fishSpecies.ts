// src/services/fishSpecies.ts
import { api, upload, unwrap } from './https';
import RNFS from 'react-native-fs';

/** One species row */
export type FishSpecies = {
  id: number | string;
  species_name: string;
  quantity_kg: number;
  type: 'caught' | 'discarded' | string;
  grade?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateFishSpeciesBody = {
  // Server validator expects these names
  species_name: string;                 // required
  quantity?: number;                    // preferred key
  quantity_kg?: number;                 // legacy support; will be mapped to quantity
  type: 'catch' | 'discard';            // required
  grade?: 'A' | 'B' | 'C' | 'D' | null; // optional
  notes?: string | null;                // optional
  // Any additional client-only fields are ignored
  [extra: string]: any;
};

export type UploadablePhoto = {
  uri: string;
  name?: string;
  type?: string;
};

/** Create species for an activity */
export async function createFishSpecies(
  fishingActivityId: number | string,
  body: CreateFishSpeciesBody,
) {
  const payload = {
    fishing_activity_id: fishingActivityId,
    species_name: body.species_name,
    // Send both keys to satisfy varying server validators
    quantity_kg: body.quantity_kg ?? body.quantity ?? 0,
    quantity: body.quantity ?? body.quantity_kg ?? 0,
    type: body.type,
    grade: body.grade ?? null,
    notes: body.notes ?? null,
  };
  const json = await api(`/fishing-activities/${fishingActivityId}/add-fish-species`, {
    method: 'POST',
    body: payload,
  });
  return unwrap<FishSpecies>(json);
}

/** Create species with photos (base64 JSON). Converts photos to base64 and sends as JSON. */
export async function createFishSpeciesWithPhotos(
  fishingActivityId: number | string,
  body: CreateFishSpeciesBody,
  photos: UploadablePhoto[],
) {
  console.log('[FishSpecies] Starting base64 conversion for', photos.length, 'photos');
  
  // Convert photos to base64
  const base64Photos: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (!photo.uri) {
      console.log(`[FishSpecies] Skipping photo ${i} - no URI`);
      continue;
    }
    
    console.log(`[FishSpecies] Converting photo ${i}:`, photo.uri);
    
    try {
      // Convert file URI to base64 using react-native-fs
      console.log(`[FishSpecies] Reading file: ${photo.uri}`);
      const base64Data = await RNFS.readFile(photo.uri, 'base64');
      console.log(`[FishSpecies] Photo ${i} base64 length:`, base64Data.length);
      
      base64Photos.push(base64Data);
      console.log(`[FishSpecies] Photo ${i} converted successfully`);
    } catch (error) {
      console.warn(`[FishSpecies] Failed to convert photo ${i} to base64:`, error);
    }
  }
  
  console.log('[FishSpecies] Base64 conversion complete. Total photos:', base64Photos.length);

  const payload = {
    fishing_activity_id: fishingActivityId,
    species_name: body.species_name,
    quantity_kg: body.quantity_kg ?? body.quantity ?? 0,
    quantity: body.quantity ?? body.quantity_kg ?? 0,
    type: body.type,
    grade: body.grade ?? null,
    notes: body.notes ?? null,
    photos: base64Photos,
  };

  console.log('[FishSpecies] Final payload photos count:', payload.photos.length);
  console.log('[FishSpecies] Sending request with photos...');

  const json = await api(`/fishing-activities/${fishingActivityId}/add-fish-species`, {
    method: 'POST',
    body: payload,
  });
  
  console.log('[FishSpecies] API response received');
  return unwrap<FishSpecies>(json);
}

/** List species for an activity */
export async function listFishSpecies(fishingActivityId: number | string) {
  const json = await api(
    `/fishing-activities/${fishingActivityId}/fish-species`,
    { method: 'GET' },
  );
  return unwrap<FishSpecies[] | { data: FishSpecies[] }>(json);
}