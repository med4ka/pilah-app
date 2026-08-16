const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

// Generic API response envelope. Every function below uses this wrapper,
// so `any` is never used in this file.
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  karma_points: number;
  collector_earnings?: number;
  vehicle_type?: string;
  service_area?: string;
  bank_name?: string;
  bank_account_number?: string;
}

export interface Pickup {
  id: string;
  status: string;
  latitude?: number;
  longitude?: number;
  est_plastic_weight?: number;
  est_cardboard_weight?: number;
  est_glass_weight?: number;
  plastic_weight?: number;
  cardboard_weight?: number;
  glass_weight?: number;
  photo_url?: string;
  ipfs_hash?: string;
  karma_earned?: number;
  earnings_earned?: number;
  created_at: string;
  updated_at: string;
}

export type PickupStatus = 'PENDING' | 'ACCEPTED' | 'VERIFYING' | 'COMPLETED';

export interface RegisterPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  karma_points: number;
}

interface ApiEnvelope<T> {
  status: string;
  message?: string;
  data: T;
}

// Single wrapper for all API requests. credentials: "include" ensures the
// httpOnly cookie (pilah_token) is sent on every request.
async function request<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const data = (await res.json()) as Partial<ApiEnvelope<T>>;
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data as ApiEnvelope<T>;
}

export const registerUser = async (name: string, email: string, password: string, role: 'user' | 'collector' = 'user') => {
  return request<RegisterPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
};

export const loginUser = async (email: string, password: string) => {
  const data = await request<RegisterPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data.data;
};

export const logoutUser = async () => {
  return request<null>('/auth/logout', {
    method: 'POST',
  });
};

export interface PickupEstimate {
  estPlasticWeight?: number;
  estCardboardWeight?: number;
  estGlassWeight?: number;
}

export const createPickupRequest = async (lat: number, lng: number, estimate?: PickupEstimate) => {
  const data = await request<Pickup>('/pickups', {
    method: 'POST',
    body: JSON.stringify({
      latitude: lat,
      longitude: lng,
      ...(estimate?.estPlasticWeight !== undefined ? { est_plastic_weight: estimate.estPlasticWeight } : {}),
      ...(estimate?.estCardboardWeight !== undefined ? { est_cardboard_weight: estimate.estCardboardWeight } : {}),
      ...(estimate?.estGlassWeight !== undefined ? { est_glass_weight: estimate.estGlassWeight } : {}),
    }),
  });
  return data.data;
};

export const getUserProfile = async () => {
  const data = await request<UserProfile>('/users/me');
  return data.data;
};

export interface ProfileUpdatePayload {
  name?: string;
  vehicle_type?: string;
  service_area?: string;
  bank_name?: string;
  bank_account_number?: string;
}

export const updateProfile = async (payload: ProfileUpdatePayload) => {
  const data = await request<UserProfile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.data;
};

export const getPendingPickups = async () => {
  const data = await request<Pickup[]>('/collector/pending');
  return data.data;
};

export const acceptPickup = async (pickupId: string) => {
  return request<null>(`/collector/pickups/${pickupId}/accept`, {
    method: 'PATCH',
  });
};

export interface PickupVerification {
  plastic_weight?: number;
  cardboard_weight?: number;
  glass_weight?: number;
  photo_url?: string;
}

export const completePickup = async (pickupId: string, verification?: PickupVerification) => {
  return request<Pickup>(`/collector/pickups/${pickupId}/complete`, {
    method: 'PATCH',
    ...(verification ? { body: JSON.stringify(verification) } : {}),
  });
};

export const confirmPickup = async (pickupId: string) => {
  const data = await request<{ pickup_id: string; karma: number }>(`/pickups/${pickupId}/confirm`, {
    method: 'PATCH',
  });
  return data.data;
};

export const getUserHistory = async () => {
  const data = await request<Pickup[]>('/pickups/history');
  return data.data;
};

export const getCollectorHistory = async () => {
  const data = await request<Pickup[]>('/pickups/collector-history');
  return data.data;
};

export interface RedeemKarmaResponse {
  new_balance: number;
  rupiah_value: number;
}

// Redeem Cuan: karma is actually deducted server-side (atomic transaction);
// rupiah_value only simulates a payout (no real payment gateway).
export const redeemKarma = async (amountKarma: number) => {
  const data = await request<RedeemKarmaResponse>('/karma/redeem', {
    method: 'POST',
    body: JSON.stringify({ amount_karma: amountKarma }),
  });
  return data.data;
};

export interface RedeemEarningsResponse {
  new_balance: number;
}

// Collector earnings: earnings balance (Rupiah) is actually deducted server-side
// (atomic transaction); the payout only simulates transfer to the collector's method.
export const redeemEarnings = async (amountRupiah: number) => {
  const data = await request<RedeemEarningsResponse>('/earnings/redeem', {
    method: 'POST',
    body: JSON.stringify({ amount_rupiah: amountRupiah }),
  });
  return data.data;
};
