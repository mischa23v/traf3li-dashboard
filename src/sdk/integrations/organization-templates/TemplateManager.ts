/**
 * Template Manager
 * Manages organization templates and their application
 */

import type {
  OrganizationTemplate,
  TemplateApplication,
  TemplateType,
} from './types';
import { templates, getTemplate } from './templates';

export interface TemplateManagerConfig {
  /** API URL for template operations */
  apiUrl: string;
  /** Custom fetch function */
  fetch?: typeof fetch;
}

export class TemplateManager {
  private config: TemplateManagerConfig;

  constructor(config: TemplateManagerConfig) {
    this.config = config;
  }

  /**
   * Get all available templates
   */
  getTemplates(): OrganizationTemplate[] {
    return Object.values(templates);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): OrganizationTemplate | undefined {
    return getTemplate(id);
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: TemplateType): OrganizationTemplate[] {
    return Object.values(templates).filter((t) => t.type === type);
  }

  /**
   * Create a custom template based on existing one
   */
  createCustomTemplate(
    baseTemplateId: string,
    overrides: Partial<OrganizationTemplate>
  ): OrganizationTemplate {
    const baseTemplate = getTemplate(baseTemplateId);
    if (!baseTemplate) {
      throw new Error(`Template "${baseTemplateId}" not found`);
    }

    return this.mergeTemplate(baseTemplate, overrides);
  }

  /**
   * Merge template with overrides
   */
  private mergeTemplate(
    base: OrganizationTemplate,
    overrides: Partial<OrganizationTemplate>
  ): OrganizationTemplate {
    return {
      ...base,
      ...overrides,
      id: overrides.id || `custom-${Date.now()}`,
      type: 'custom',
      authMethods: {
        ...base.authMethods,
        ...overrides.authMethods,
      },
      passwordPolicy: {
        ...base.passwordPolicy,
        ...overrides.passwordPolicy,
      },
      mfaPolicy: {
        ...base.mfaPolicy,
        ...overrides.mfaPolicy,
      },
      sessionPolicy: {
        ...base.sessionPolicy,
        ...overrides.sessionPolicy,
      },
      ssoPolicy: {
        ...base.ssoPolicy,
        ...overrides.ssoPolicy,
      },
      securityPolicy: {
        ...base.securityPolicy,
        ...overrides.securityPolicy,
      },
      compliance: {
        ...base.compliance,
        ...overrides.compliance,
      },
      notifications: {
        ...base.notifications,
        ...overrides.notifications,
      },
      branding: {
        ...base.branding,
        ...overrides.branding,
      },
      customSettings: {
        ...base.customSettings,
        ...overrides.customSettings,
      },
    };
  }

  /**
   * Apply template to an organization
   */
  async applyTemplate(
    organizationId: string,
    templateId: string,
    overrides?: Partial<OrganizationTemplate>
  ): Promise<TemplateApplication> {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const finalTemplate = overrides
      ? this.mergeTemplate(template, overrides)
      : template;

    const fetchFn = this.config.fetch ?? fetch;
    const response = await fetchFn(
      `${this.config.apiUrl}/api/organizations/${organizationId}/template`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          template: finalTemplate,
          overrides,
        }),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to apply template');
    }

    return response.json();
  }

  /**
   * Get current template for an organization
   */
  async getOrganizationTemplate(
    organizationId: string
  ): Promise<TemplateApplication | null> {
    const fetchFn = this.config.fetch ?? fetch;
    const response = await fetchFn(
      `${this.config.apiUrl}/api/organizations/${organizationId}/template`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get template');
    }

    return response.json();
  }

  /**
   * Remove template from an organization
   */
  async removeTemplate(organizationId: string): Promise<void> {
    const fetchFn = this.config.fetch ?? fetch;
    const response = await fetchFn(
      `${this.config.apiUrl}/api/organizations/${organizationId}/template`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to remove template');
    }
  }

  /**
   * Validate template configuration
   */
  validateTemplate(template: Partial<OrganizationTemplate>): string[] {
    const errors: string[] = [];

    // Password policy validation
    if (template.passwordPolicy) {
      const pp = template.passwordPolicy;
      if (pp.minLength < 8) {
        errors.push('Minimum password length should be at least 8 characters');
      }
      if (pp.lockoutThreshold < 1) {
        errors.push('Lockout threshold should be at least 1');
      }
      if (pp.lockoutDuration < 1) {
        errors.push('Lockout duration should be at least 1 minute');
      }
    }

    // MFA policy validation
    if (template.mfaPolicy) {
      const mfa = template.mfaPolicy;
      if (mfa.required && mfa.methods.length === 0) {
        errors.push('At least one MFA method is required when MFA is mandatory');
      }
    }

    // Session policy validation
    if (template.sessionPolicy) {
      const sp = template.sessionPolicy;
      if (sp.sessionTimeout < sp.idleTimeout) {
        errors.push('Session timeout should be greater than idle timeout');
      }
      if (sp.maxConcurrentSessions < 1) {
        errors.push('Maximum concurrent sessions should be at least 1');
      }
    }

    // Compliance validation
    if (template.compliance) {
      const c = template.compliance;
      if (c.hipaaEnabled && template.mfaPolicy && !template.mfaPolicy.required) {
        errors.push('HIPAA compliance requires mandatory MFA');
      }
      if (c.dataRetentionDays < 365 && c.hipaaEnabled) {
        errors.push('HIPAA compliance requires minimum 1 year data retention');
      }
    }

    return errors;
  }

  /**
   * Compare two templates
   */
  compareTemplates(
    template1: OrganizationTemplate,
    template2: OrganizationTemplate
  ): Record<string, { before: unknown; after: unknown }> {
    const differences: Record<string, { before: unknown; after: unknown }> = {};

    const compareObjects = (
      obj1: Record<string, unknown>,
      obj2: Record<string, unknown>,
      prefix: string
    ) => {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

      for (const key of allKeys) {
        const path = prefix ? `${prefix}.${key}` : key;
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (typeof val1 === 'object' && typeof val2 === 'object' && val1 && val2) {
          compareObjects(
            val1 as Record<string, unknown>,
            val2 as Record<string, unknown>,
            path
          );
        } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          differences[path] = { before: val1, after: val2 };
        }
      }
    };

    compareObjects(
      template1 as unknown as Record<string, unknown>,
      template2 as unknown as Record<string, unknown>,
      ''
    );

    return differences;
  }
}

export default TemplateManager;
