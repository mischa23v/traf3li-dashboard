/**
 * usePermissions Hook
 * Role-based access control (RBAC) and permissions management
 */

import { useState, useCallback, useMemo } from 'react';
import { useTrafAuthContext } from '../provider';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | '*';
  scope?: 'own' | 'org' | 'all';
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  directPermissions: Permission[];
  effectivePermissions: Permission[];
}

export interface PermissionCheck {
  resource: string;
  action: string;
  resourceId?: string;
}

export interface UsePermissionsReturn {
  /** Current user's permissions */
  userPermissions: UserPermissions | null;
  /** Available roles */
  roles: Role[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Check if user has permission */
  hasPermission: (check: PermissionCheck) => boolean;
  /** Check if user has any of the permissions */
  hasAnyPermission: (checks: PermissionCheck[]) => boolean;
  /** Check if user has all permissions */
  hasAllPermissions: (checks: PermissionCheck[]) => boolean;
  /** Check if user has role */
  hasRole: (roleName: string) => boolean;
  /** Get user's effective permissions */
  getPermissions: () => Promise<UserPermissions>;
  /** Get all available roles */
  getRoles: () => Promise<Role[]>;
  /** Create a new role (admin) */
  createRole: (data: { name: string; description?: string; permissions: string[] }) => Promise<Role>;
  /** Update a role (admin) */
  updateRole: (roleId: string, data: Partial<{ name: string; description?: string; permissions: string[] }>) => Promise<Role>;
  /** Delete a role (admin) */
  deleteRole: (roleId: string) => Promise<void>;
  /** Assign role to user (admin) */
  assignRole: (userId: string, roleId: string) => Promise<void>;
  /** Remove role from user (admin) */
  removeRole: (userId: string, roleId: string) => Promise<void>;
  /** Get available permissions */
  getAvailablePermissions: () => Promise<Permission[]>;
}

export function usePermissions(): UsePermissionsReturn {
  const { client, isAuthenticated, user } = useTrafAuthContext();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effective permissions map for quick lookup
  const permissionMap = useMemo(() => {
    if (!userPermissions) return new Map<string, Permission>();

    const map = new Map<string, Permission>();
    userPermissions.effectivePermissions.forEach((p) => {
      const key = `${p.resource}:${p.action}`;
      map.set(key, p);
      // Also add wildcard permission
      if (p.action === '*') {
        ['create', 'read', 'update', 'delete', 'manage'].forEach((action) => {
          map.set(`${p.resource}:${action}`, p);
        });
      }
    });
    return map;
  }, [userPermissions]);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (check: PermissionCheck): boolean => {
      if (!userPermissions) return false;

      const key = `${check.resource}:${check.action}`;
      const wildcardKey = `${check.resource}:*`;
      const globalKey = `*:${check.action}`;
      const superAdminKey = '*:*';

      return (
        permissionMap.has(key) ||
        permissionMap.has(wildcardKey) ||
        permissionMap.has(globalKey) ||
        permissionMap.has(superAdminKey)
      );
    },
    [permissionMap, userPermissions]
  );

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback(
    (checks: PermissionCheck[]): boolean => {
      return checks.some((check) => hasPermission(check));
    },
    [hasPermission]
  );

  // Check if user has all permissions
  const hasAllPermissions = useCallback(
    (checks: PermissionCheck[]): boolean => {
      return checks.every((check) => hasPermission(check));
    },
    [hasPermission]
  );

  // Check if user has a specific role
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!userPermissions) return false;
      return userPermissions.roles.some(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      );
    },
    [userPermissions]
  );

  // Get user's permissions
  const getPermissions = useCallback(async (): Promise<UserPermissions> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/permissions/me`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      const permissions: UserPermissions = {
        userId: data.userId || user?.id || '',
        roles: (data.roles || []).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })),
        directPermissions: data.directPermissions || [],
        effectivePermissions: data.effectivePermissions || data.permissions || [],
      };

      setUserPermissions(permissions);
      return permissions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch permissions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated, user]);

  // Get all roles
  const getRoles = useCallback(async (): Promise<Role[]> => {
    if (!isAuthenticated) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/permissions/roles`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      const fetchedRoles = (data.roles || []).map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }));

      setRoles(fetchedRoles);
      return fetchedRoles;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch roles';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Create role
  const createRole = useCallback(
    async (data: { name: string; description?: string; permissions: string[] }): Promise<Role> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/permissions/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create role');
        }

        const result = await response.json();
        const newRole = {
          ...result.role,
          createdAt: new Date(result.role.createdAt),
          updatedAt: new Date(result.role.updatedAt),
        };

        setRoles((prev) => [...prev, newRole]);
        return newRole;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Update role
  const updateRole = useCallback(
    async (
      roleId: string,
      data: Partial<{ name: string; description?: string; permissions: string[] }>
    ): Promise<Role> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/permissions/roles/${roleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update role');
        }

        const result = await response.json();
        const updatedRole = {
          ...result.role,
          createdAt: new Date(result.role.createdAt),
          updatedAt: new Date(result.role.updatedAt),
        };

        setRoles((prev) => prev.map((r) => (r.id === roleId ? updatedRole : r)));
        return updatedRole;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Delete role
  const deleteRole = useCallback(
    async (roleId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/permissions/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete role');
        }

        setRoles((prev) => prev.filter((r) => r.id !== roleId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Assign role to user
  const assignRole = useCallback(
    async (userId: string, roleId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/permissions/users/${userId}/roles`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
            body: JSON.stringify({ roleId }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to assign role');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to assign role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Remove role from user
  const removeRole = useCallback(
    async (userId: string, roleId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/permissions/users/${userId}/roles/${roleId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove role');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Get available permissions
  const getAvailablePermissions = useCallback(async (): Promise<Permission[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/permissions/available`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available permissions');
      }

      const data = await response.json();
      return data.permissions || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch permissions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return {
    userPermissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getPermissions,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    removeRole,
    getAvailablePermissions,
  };
}

export default usePermissions;
