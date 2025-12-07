/**
 * Push Notifications Utility
 * Handles service worker registration and push subscription management
 */

import apiClient from '@/lib/api'

// VAPID public key from backend
const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BBPHXE1quI58UtPRW7BUWKGyqX7G2dJuYwsBpJi27_seabDaBY2J_c5GzN83rzBthjcx_iCtIkWX1z3x1iwf6J0'

// Service worker registration
let swRegistration: ServiceWorkerRegistration | null = null

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Check current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    // Unregister any existing service workers first
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('sw.js')) {
        // Keep our service worker
        swRegistration = registration
        return registration
      }
    }

    // Register new service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    swRegistration = registration

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready

    return registration
  } catch (error) {
    return null
  }
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) {
    return swRegistration
  }

  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    swRegistration = registration
    return registration
  } catch (error) {
    return null
  }
}

/**
 * Convert URL-safe base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    // Request permission first
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      return null
    }

    // Get service worker registration
    const registration = await getServiceWorkerRegistration()
    if (!registration) {
      return null
    }

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      // Save to backend (in case it changed)
      await saveSubscriptionToBackend(subscription)
      return subscription
    }

    // Subscribe to push
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })


    // Save subscription to backend
    await saveSubscriptionToBackend(subscription)

    return subscription
  } catch (error) {
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await getServiceWorkerRegistration()
    if (!registration) {
      return true
    }

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      return true
    }

    // Unsubscribe
    await subscription.unsubscribe()

    // Remove from backend
    await removeSubscriptionFromBackend()

    return true
  } catch (error) {
    return false
  }
}

/**
 * Check if currently subscribed to push
 */
export async function isSubscribedToPush(): Promise<boolean> {
  try {
    const registration = await getServiceWorkerRegistration()
    if (!registration) {
      return false
    }

    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    return false
  }
}

/**
 * Save subscription to backend
 */
async function saveSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
  try {
    await apiClient.post('/users/push-subscription', {
      subscription: subscription.toJSON(),
    })
  } catch (error) {
    throw error
  }
}

/**
 * Remove subscription from backend
 */
async function removeSubscriptionFromBackend(): Promise<void> {
  try {
    await apiClient.delete('/users/push-subscription')
  } catch (error) {
  }
}

/**
 * Get VAPID public key from backend
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await apiClient.get<{ vapidPublicKey: string }>('/users/vapid-public-key')
    return response.data.vapidPublicKey
  } catch (error) {
    return VAPID_PUBLIC_KEY
  }
}

/**
 * Initialize push notifications
 * Call this on app startup
 */
export async function initializePushNotifications(): Promise<void> {
  if (!isPushSupported()) {
    return
  }

  // Register service worker
  await registerServiceWorker()

  // Check if we should auto-subscribe
  const permission = getNotificationPermission()
  if (permission === 'granted') {
    // Re-subscribe to ensure backend has the subscription
    const isSubscribed = await isSubscribedToPush()
    if (isSubscribed) {
      const registration = await getServiceWorkerRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await saveSubscriptionToBackend(subscription)
      }
    }
  }
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    return
  }

  const registration = await getServiceWorkerRegistration()
  if (!registration) {
    return
  }

  await registration.showNotification('Test Notification', {
    body: 'This is a test notification from TRAF3LI',
    icon: '/images/logo-192.png',
    badge: '/images/badge-72.png',
    tag: 'test',
    vibrate: [100, 50, 100],
  })
}

export default {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  initializePushNotifications,
  showTestNotification,
}
