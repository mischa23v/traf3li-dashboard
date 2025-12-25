/**
 * useOrganizationTemplate Hook
 * React hook for managing organization templates
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TemplateManager, TemplateManagerConfig } from './TemplateManager';
import type {
  OrganizationTemplate,
  TemplateApplication,
  TemplateType,
} from './types';

export interface UseOrganizationTemplateOptions extends TemplateManagerConfig {
  /** Organization ID */
  organizationId?: string;
  /** Auto-fetch current template on mount */
  autoFetch?: boolean;
}

export interface UseOrganizationTemplateReturn {
  /** All available templates */
  templates: OrganizationTemplate[];
  /** Current organization template */
  currentTemplate: TemplateApplication | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Get template by ID */
  getTemplate: (id: string) => OrganizationTemplate | undefined;
  /** Get templates by type */
  getTemplatesByType: (type: TemplateType) => OrganizationTemplate[];
  /** Apply template to organization */
  applyTemplate: (
    templateId: string,
    overrides?: Partial<OrganizationTemplate>
  ) => Promise<TemplateApplication>;
  /** Remove template from organization */
  removeTemplate: () => Promise<void>;
  /** Create custom template */
  createCustomTemplate: (
    baseTemplateId: string,
    overrides: Partial<OrganizationTemplate>
  ) => OrganizationTemplate;
  /** Validate template */
  validateTemplate: (template: Partial<OrganizationTemplate>) => string[];
  /** Compare templates */
  compareTemplates: (
    template1: OrganizationTemplate,
    template2: OrganizationTemplate
  ) => Record<string, { before: unknown; after: unknown }>;
  /** Refresh current template */
  refresh: () => Promise<void>;
}

export function useOrganizationTemplate(
  options: UseOrganizationTemplateOptions
): UseOrganizationTemplateReturn {
  const { organizationId, autoFetch = true, ...config } = options;

  const [templates, setTemplates] = useState<OrganizationTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const managerRef = useRef<TemplateManager | null>(null);

  // Initialize manager
  useEffect(() => {
    managerRef.current = new TemplateManager(config);
    setTemplates(managerRef.current.getTemplates());
  }, [config.apiUrl]);

  // Fetch current template on mount
  useEffect(() => {
    if (autoFetch && organizationId) {
      fetchCurrentTemplate();
    }
  }, [organizationId, autoFetch]);

  // Fetch current template
  const fetchCurrentTemplate = useCallback(async () => {
    if (!organizationId || !managerRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const template = await managerRef.current.getOrganizationTemplate(organizationId);
      setCurrentTemplate(template);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Get template by ID
  const getTemplate = useCallback((id: string) => {
    return managerRef.current?.getTemplateById(id);
  }, []);

  // Get templates by type
  const getTemplatesByType = useCallback((type: TemplateType) => {
    return managerRef.current?.getTemplatesByType(type) || [];
  }, []);

  // Apply template
  const applyTemplate = useCallback(
    async (
      templateId: string,
      overrides?: Partial<OrganizationTemplate>
    ): Promise<TemplateApplication> => {
      if (!organizationId || !managerRef.current) {
        throw new Error('Organization ID is required');
      }

      setLoading(true);
      setError(null);

      try {
        const application = await managerRef.current.applyTemplate(
          organizationId,
          templateId,
          overrides
        );
        setCurrentTemplate(application);
        return application;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  // Remove template
  const removeTemplate = useCallback(async () => {
    if (!organizationId || !managerRef.current) {
      throw new Error('Organization ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      await managerRef.current.removeTemplate(organizationId);
      setCurrentTemplate(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Create custom template
  const createCustomTemplate = useCallback(
    (baseTemplateId: string, overrides: Partial<OrganizationTemplate>) => {
      if (!managerRef.current) {
        throw new Error('Template manager not initialized');
      }
      return managerRef.current.createCustomTemplate(baseTemplateId, overrides);
    },
    []
  );

  // Validate template
  const validateTemplate = useCallback((template: Partial<OrganizationTemplate>) => {
    if (!managerRef.current) {
      throw new Error('Template manager not initialized');
    }
    return managerRef.current.validateTemplate(template);
  }, []);

  // Compare templates
  const compareTemplates = useCallback(
    (template1: OrganizationTemplate, template2: OrganizationTemplate) => {
      if (!managerRef.current) {
        throw new Error('Template manager not initialized');
      }
      return managerRef.current.compareTemplates(template1, template2);
    },
    []
  );

  return {
    templates,
    currentTemplate,
    loading,
    error,
    getTemplate,
    getTemplatesByType,
    applyTemplate,
    removeTemplate,
    createCustomTemplate,
    validateTemplate,
    compareTemplates,
    refresh: fetchCurrentTemplate,
  };
}

export default useOrganizationTemplate;
