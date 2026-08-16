'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { getUserProfile } from '@/lib/api'

// Runs once on app load to detect login status via cookie.
// GET /users/me 200 -> logged in (cookie sent automatically via credentials: "include"),
// 401 -> not logged in.
export default function AuthBootstrap() {
  const userData = useAuthStore((s) => s.userData)
  const setUserData = useAuthStore((s) => s.setUserData)
  const clearNotifications = useNotificationStore((s) => s.clearAll)

  useEffect(() => {
    getUserProfile()
      .then((data) => setUserData(data))
      .catch(() => setUserData(null))
  }, [setUserData])

  // In-app notifications are strictly per-session: reset on logout / not logged in
  // so they don't leak between accounts.
  useEffect(() => {
    if (!userData) clearNotifications()
  }, [userData, clearNotifications])

  return null
}
