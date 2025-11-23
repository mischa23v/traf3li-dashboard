/**
 * Apps Service
 * Handles all app integration API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

export interface App {
  id: string
  name: string
  iconName: string
  connected: boolean
  desc: string
  category?: string
  createdAt?: string
  updatedAt?: string
}

export interface GetAppsParams {
  type?: 'all' | 'connected' | 'notConnected'
  filter?: string
  sort?: 'asc' | 'desc'
}

export interface ConnectAppData {
  credentials?: Record<string, any>
  settings?: Record<string, any>
}

export const getApps = async (params?: GetAppsParams): Promise<App[]> => {
  try {
    const response = await apiClient.get('/apps', { params })
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const getApp = async (appId: string): Promise<App> => {
  try {
    const response = await apiClient.get(`/apps/${appId}`)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const connectApp = async (
  appId: string,
  data?: ConnectAppData
): Promise<App> => {
  try {
    const response = await apiClient.post(`/apps/${appId}/connect`, data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const disconnectApp = async (appId: string): Promise<App> => {
  try {
    const response = await apiClient.post(`/apps/${appId}/disconnect`)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

const appsService = {
  getApps,
  getApp,
  connectApp,
  disconnectApp,
}

export default appsService
