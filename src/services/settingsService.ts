/**
 * Settings Service
 * Handles all user settings-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

export interface UserSettings {
  _id: string
  userId: string
  account: {
    name: string
    email: string
    dob?: string
    language: string
    timezone: string
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    fontSize: 'small' | 'medium' | 'large'
    sidebarCollapsed: boolean
  }
  display: {
    dateFormat: string
    timeFormat: '12h' | '24h'
    currency: string
    startOfWeek: 'sunday' | 'monday'
    compactMode: boolean
  }
  notifications: {
    email: {
      enabled: boolean
      newMessages: boolean
      taskReminders: boolean
      caseUpdates: boolean
      financialAlerts: boolean
    }
    push: {
      enabled: boolean
      newMessages: boolean
      taskReminders: boolean
      caseUpdates: boolean
    }
    inApp: {
      enabled: boolean
      sound: boolean
      desktop: boolean
    }
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateAccountSettings {
  name?: string
  dob?: string
  language?: string
  timezone?: string
}

export interface UpdateAppearanceSettings {
  theme?: 'light' | 'dark' | 'system'
  accentColor?: string
  fontSize?: 'small' | 'medium' | 'large'
  sidebarCollapsed?: boolean
}

export interface UpdateDisplaySettings {
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  currency?: string
  startOfWeek?: 'sunday' | 'monday'
  compactMode?: boolean
}

export interface UpdateNotificationSettings {
  email?: {
    enabled?: boolean
    newMessages?: boolean
    taskReminders?: boolean
    caseUpdates?: boolean
    financialAlerts?: boolean
  }
  push?: {
    enabled?: boolean
    newMessages?: boolean
    taskReminders?: boolean
    caseUpdates?: boolean
  }
  inApp?: {
    enabled?: boolean
    sound?: boolean
    desktop?: boolean
  }
}

export const getSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiClient.get('/settings')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const updateAccountSettings = async (data: UpdateAccountSettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/account', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const updateAppearanceSettings = async (data: UpdateAppearanceSettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/appearance', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const updateDisplaySettings = async (data: UpdateDisplaySettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/display', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const updateNotificationSettings = async (data: UpdateNotificationSettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/notifications', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

const settingsService = {
  getSettings,
  updateAccountSettings,
  updateAppearanceSettings,
  updateDisplaySettings,
  updateNotificationSettings,
}

export default settingsService
