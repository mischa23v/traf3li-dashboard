/**
 * IP Whitelist Service
 *
 * This service handles IP whitelist management for firms.
 * It allows admins to restrict firm access to specific IP addresses.
 *
 * ## Features
 * - Permanent IP whitelist management
 * - Temporary IP allowances with duration (24h, 7d, 30d)
 * - Enable/disable IP filtering
 * - Test current IP access
 *
 * ## Authentication
 * Most endpoints require Admin/Owner role except:
 * - testAccess: Member role
 *
 * ## IP Formats Supported
 * - Single IPv4: 192.168.1.100
 * - CIDR notation: 192.168.1.0/24
 * - IP Range: 192.168.1.1-192.168.1.255
 * - IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  GetIPWhitelistResponse,
  AddIPRequest,
  AddPermanentIPResponse,
  AddTemporaryIPResponse,
  RemoveIPResponse,
  TestIPAccessResponse,
  EnableIPWhitelistRequest,
  EnableIPWhitelistResponse,
  DisableIPWhitelistResponse,
  RevokeTemporaryIPRequest,
  RevokeTemporaryIPResponse,
  IPWhitelistData,
} from '@/types/ipWhitelist'

const BASE_URL = '/firms'

/**
 * IP Whitelist Service
 */
const ipWhitelistService = {
  /**
   * Get IP whitelist for a firm
   * GET /firms/:firmId/ip-whitelist
   *
   * @param firmId - The firm ID
   * @returns IP whitelist data including permanent and temporary entries
   */
  getWhitelist: async (firmId: string): Promise<IPWhitelistData> => {
    try {
      const response = await apiClient.get<GetIPWhitelistResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add IP to whitelist (permanent or temporary)
   * POST /firms/:firmId/ip-whitelist
   *
   * @param firmId - The firm ID
   * @param payload - IP data including address, description, and optional temporary settings
   * @returns The added IP entry response
   *
   * @example
   * // Add permanent IP
   * await ipWhitelistService.addIP(firmId, {
   *   ip: '192.168.1.100',
   *   description: 'Main office'
   * });
   *
   * @example
   * // Add temporary IP (7 days)
   * await ipWhitelistService.addIP(firmId, {
   *   ip: '203.0.113.45',
   *   description: 'Remote work - Dubai trip',
   *   temporary: true,
   *   durationHours: 168
   * });
   */
  addIP: async (
    firmId: string,
    payload: AddIPRequest
  ): Promise<AddPermanentIPResponse | AddTemporaryIPResponse> => {
    try {
      const response = await apiClient.post<AddPermanentIPResponse | AddTemporaryIPResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist`,
        payload
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove permanent IP from whitelist
   * DELETE /firms/:firmId/ip-whitelist/:ip
   *
   * @param firmId - The firm ID
   * @param ip - The IP address to remove (will be URL encoded)
   * @returns Remove response with updated whitelist
   */
  removeIP: async (firmId: string, ip: string): Promise<RemoveIPResponse> => {
    try {
      const encodedIP = encodeURIComponent(ip)
      const response = await apiClient.delete<RemoveIPResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist/${encodedIP}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Test if current user's IP would be allowed
   * POST /firms/:firmId/ip-whitelist/test
   *
   * @param firmId - The firm ID
   * @returns Test result including current IP, allowed status, and reason
   */
  testAccess: async (firmId: string): Promise<TestIPAccessResponse> => {
    try {
      const response = await apiClient.post<TestIPAccessResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist/test`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Enable IP whitelisting for a firm
   * POST /firms/:firmId/ip-whitelist/enable
   *
   * @param firmId - The firm ID
   * @param options - Optional settings (autoWhitelistCurrentIP defaults to true)
   * @returns Enable response with warnings if applicable
   */
  enable: async (
    firmId: string,
    options: EnableIPWhitelistRequest = {}
  ): Promise<EnableIPWhitelistResponse> => {
    try {
      const response = await apiClient.post<EnableIPWhitelistResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist/enable`,
        options
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Disable IP whitelisting for a firm
   * POST /firms/:firmId/ip-whitelist/disable
   *
   * @param firmId - The firm ID
   * @returns Disable response
   */
  disable: async (firmId: string): Promise<DisableIPWhitelistResponse> => {
    try {
      const response = await apiClient.post<DisableIPWhitelistResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist/disable`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke a temporary IP allowance early
   * DELETE /firms/:firmId/ip-whitelist/temporary/:allowanceId
   *
   * @param firmId - The firm ID
   * @param allowanceId - The temporary allowance ID to revoke
   * @param payload - Optional reason for revocation
   * @returns Revoke response with timestamp
   */
  revokeTemporary: async (
    firmId: string,
    allowanceId: string,
    payload?: RevokeTemporaryIPRequest
  ): Promise<RevokeTemporaryIPResponse> => {
    try {
      const response = await apiClient.delete<RevokeTemporaryIPResponse>(
        `${BASE_URL}/${firmId}/ip-whitelist/temporary/${allowanceId}`,
        { data: payload }
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default ipWhitelistService
