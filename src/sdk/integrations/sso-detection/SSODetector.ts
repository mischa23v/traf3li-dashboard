/**
 * SSO Detector
 * Detects SSO configuration for email domains
 */

import type {
  SSODetectionConfig,
  SSODetectionResult,
  SSODomainMapping,
  SSOLoginOptions,
} from './types';

interface CacheEntry {
  result: SSODetectionResult;
  timestamp: number;
}

export class SSODetector {
  private config: SSODetectionConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<SSODetectionResult>> = new Map();

  constructor(config: SSODetectionConfig) {
    this.config = {
      cacheDuration: 5 * 60 * 1000, // 5 minutes default
      ...config,
    };
  }

  /**
   * Extract domain from email address
   */
  static extractDomain(email: string): string | null {
    const match = email.match(/@([a-zA-Z0-9.-]+)$/);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Check if email domain is excluded from SSO
   */
  private isExcluded(domain: string): boolean {
    if (!this.config.excludeDomains) return false;
    return this.config.excludeDomains.some((excluded) => {
      if (excluded.startsWith('*.')) {
        const suffix = excluded.slice(2);
        return domain === suffix || domain.endsWith(`.${suffix}`);
      }
      return domain === excluded;
    });
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(domain: string): SSODetectionResult | null {
    const entry = this.cache.get(domain);
    if (!entry) return null;

    const isExpired =
      Date.now() - entry.timestamp > (this.config.cacheDuration ?? 300000);
    if (isExpired) {
      this.cache.delete(domain);
      return null;
    }

    return entry.result;
  }

  /**
   * Store in cache
   */
  private storeInCache(domain: string, result: SSODetectionResult): void {
    this.cache.set(domain, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Detect SSO configuration for an email address
   */
  async detect(email: string): Promise<SSODetectionResult> {
    const domain = SSODetector.extractDomain(email);

    if (!domain) {
      return {
        hasSso: false,
        allowPassword: true,
        error: 'Invalid email address',
      };
    }

    // Check exclusions
    if (this.isExcluded(domain)) {
      return {
        hasSso: false,
        allowPassword: true,
      };
    }

    // Check cache
    const cached = this.getFromCache(domain);
    if (cached) return cached;

    // Check for pending request
    const pending = this.pendingRequests.get(domain);
    if (pending) return pending;

    // Make API request
    const request = this.fetchDomainConfig(domain);
    this.pendingRequests.set(domain, request);

    try {
      const result = await request;
      this.storeInCache(domain, result);
      return result;
    } finally {
      this.pendingRequests.delete(domain);
    }
  }

  /**
   * Fetch domain configuration from API
   */
  private async fetchDomainConfig(domain: string): Promise<SSODetectionResult> {
    try {
      const fetchFn = this.config.fetch ?? fetch;
      const response = await fetchFn(
        `${this.config.apiUrl}/api/auth/sso/detect?domain=${encodeURIComponent(domain)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No SSO configured for this domain
          return {
            hasSso: false,
            allowPassword: true,
          };
        }
        throw new Error(`SSO detection failed: ${response.statusText}`);
      }

      const data = await response.json();
      const mapping = data.mapping as SSODomainMapping | undefined;

      if (!mapping) {
        return {
          hasSso: false,
          allowPassword: true,
        };
      }

      return {
        hasSso: true,
        mapping,
        allowPassword: !mapping.ssoRequired,
        redirectUrl: this.buildRedirectUrl(mapping),
      };
    } catch (error) {
      console.error('SSO detection error:', error);

      // Use default provider if configured
      if (this.config.defaultProvider) {
        return {
          hasSso: true,
          mapping: {
            domain,
            organizationId: 'default',
            provider: this.config.defaultProvider,
            ssoRequired: false,
            autoRedirect: false,
          },
          allowPassword: true,
        };
      }

      return {
        hasSso: false,
        allowPassword: true,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Build redirect URL for SSO login
   */
  private buildRedirectUrl(mapping: SSODomainMapping): string {
    const provider = mapping.provider;

    switch (provider.type) {
      case 'saml':
        return `${this.config.apiUrl}/api/auth/sso/saml/${provider.id}/login`;
      case 'oidc':
        return `${this.config.apiUrl}/api/auth/sso/oidc/${provider.id}/authorize`;
      case 'google':
        return `${this.config.apiUrl}/api/auth/oauth/google?hd=${mapping.domain}`;
      case 'microsoft':
      case 'azure-ad':
        return `${this.config.apiUrl}/api/auth/oauth/microsoft?tenant=${provider.entityId}`;
      case 'okta':
        return provider.entryPoint || `${this.config.apiUrl}/api/auth/sso/okta/${provider.id}/login`;
      default:
        return provider.entryPoint || `${this.config.apiUrl}/api/auth/sso/${provider.id}/login`;
    }
  }

  /**
   * Initiate SSO login
   */
  async login(options: SSOLoginOptions): Promise<string> {
    const result = await this.detect(options.email);

    if (!result.hasSso || !result.redirectUrl) {
      throw new Error('SSO not available for this domain');
    }

    // Build full redirect URL with parameters
    const url = new URL(result.redirectUrl);

    if (options.redirectUrl) {
      url.searchParams.set('redirect_uri', options.redirectUrl);
    }

    if (options.state) {
      url.searchParams.set('state', options.state);
    }

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    // Add email hint
    url.searchParams.set('login_hint', options.email);

    return url.toString();
  }

  /**
   * Clear cache for a domain
   */
  clearCache(domain?: string): void {
    if (domain) {
      this.cache.delete(domain);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get all cached entries
   */
  getCachedDomains(): string[] {
    return Array.from(this.cache.keys());
  }
}

export default SSODetector;
