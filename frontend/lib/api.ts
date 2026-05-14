// frontend/lib/api.ts

const API_URL = 'http://localhost:8080/api/v1';

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mendaftar');
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal login');
  return data.data.token; // Mengambil JWT Token dari response
};

export const createPickupRequest = async (token: string, lat: number, lng: number) => {
  const res = await fetch(`${API_URL}/pickups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal request jemputan');
  return data.data;
};

// [+] INI DIA FUNGSI YANG TADI HILANG/BELUM KESAVE
export const getUserProfile = async (token: string) => {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat profil');
  return data.data;
};

// MVP Version: Tarik data radar dengan Token JWT yang valid
export const getPendingPickups = async (token: string) => {
  // Catatan: Cek main.go lu, pastikan URL ini benar (/collector/pending atau /pickups/pending)
  const res = await fetch(`${API_URL}/collector/pending`, {
    headers: {
      'Authorization': `Bearer ${token}` // [+] Ini kunci masuknya!
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat radar');
  return data.data;
};

// Kolektor menerima orderan
export const acceptPickup = async (token: string, pickupId: string) => {
  const res = await fetch(`${API_URL}/collector/pickups/${pickupId}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menerima order');
  return data;
};

// Kolektor menyelesaikan order & trigger transfer Karma
export const completePickup = async (token: string, pickupId: string) => {
  const res = await fetch(`${API_URL}/collector/pickups/${pickupId}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menyelesaikan order');
  return data;
};

// Mengambil riwayat order user
export const getUserHistory = async (token: string) => {
  const res = await fetch(`${API_URL}/pickups/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat riwayat');
  return data.data; 
};

export const getCollectorHistory = async (token: string) => {
  const res = await fetch(`${API_URL}/pickups/collector-history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat riwayat');
  return data.data; 
};