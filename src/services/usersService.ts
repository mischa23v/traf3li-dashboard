/**
 * Users Service
 * Handles all user management API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

export interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  status: 'active' | 'inactive' | 'invited' | 'suspended'
  role: 'superadmin' | 'admin' | 'cashier' | 'manager'
  createdAt: string
  updatedAt: string
}

export interface UsersListResponse {
  users: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface GetUsersParams {
  page?: number
  pageSize?: number
  status?: Array<'active' | 'inactive' | 'invited' | 'suspended'>
  role?: Array<'superadmin' | 'admin' | 'cashier' | 'manager'>
  username?: string
}

export interface CreateUserData {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  role: 'superadmin' | 'admin' | 'cashier' | 'manager'
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phoneNumber?: string
  status?: 'active' | 'inactive' | 'invited' | 'suspended'
  role?: 'superadmin' | 'admin' | 'cashier' | 'manager'
}

export const getUsers = async (params?: GetUsersParams): Promise<UsersListResponse> => {
  try {
    const response = await apiClient.get('/users', { params })
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const createUser = async (data: CreateUserData): Promise<User> => {
  try {
    const response = await apiClient.post('/users', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const updateUser = async (userId: string, data: UpdateUserData): Promise<User> => {
  try {
    const response = await apiClient.patch(`/users/${userId}`, data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${userId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

export const deleteMultipleUsers = async (userIds: string[]): Promise<void> => {
  try {
    await apiClient.post('/users/bulk-delete', { userIds })
  } catch (error) {
    throw handleApiError(error)
  }
}

export const inviteUser = async (email: string, role: string): Promise<User> => {
  try {
    const response = await apiClient.post('/users/invite', { email, role })
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

const usersService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deleteMultipleUsers,
  inviteUser,
}

export default usersService
