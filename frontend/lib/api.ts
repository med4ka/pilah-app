const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
  return data.data.token; 
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

export const getUserProfile = async (token: string) => {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat profil');
  return data.data;
};

export const getPendingPickups = async (token: string) => {
  const res = await fetch(`${API_URL}/collector/pending`, {
    headers: {
      'Authorization': `Bearer ${token}` 
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat radar');
  return data.data;
};

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

export const completePickup = async (token: string, pickupId: string, payload: any) => {
  const res = await fetch(`${API_URL}/collector/pickups/${pickupId}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim data timbangan');
  return data;
};

export const getUserHistory = async (token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/pickups/history`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store' 
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal memuat riwayat: ${errorText.substring(0, 30)}`);
  }

  const data = await res.json();
  return data.data; 
}

export const getCollectorHistory = async (token: string) => {
  const res = await fetch(`${API_URL}/pickups/collector-history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat riwayat');
  return data.data; 
};

export const confirmPickupUser = async (token: string, pickupId: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/pickups/${pickupId}/confirm`, {
    method: 'PATCH', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const errorText = await res.text();
    console.error("Raw Backend Error:", errorText);
    throw new Error(`Method/Route salah di Backend! Golang merespons: ${errorText.substring(0, 20)}...`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal konfirmasi order');
  return data;
}