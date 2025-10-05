import { BlogOwner, createBlogOwnerFromEnv, validateAdminSecret } from '@/models/BlogOwner';

export class AuthService {
  /**
   * Verify admin secret from request
   */
  static verifyAdminSecret(secret: string | undefined): boolean {
    if (!secret) {
      return false;
    }

    const adminSecret = process.env.ADMIN_SECRET;

    // Validate environment secret
    if (!validateAdminSecret(adminSecret)) {
      throw new Error('ADMIN_SECRET not configured or invalid (must be at least 32 characters)');
    }

    return secret === adminSecret;
  }

  /**
   * Get blog owner information from environment
   */
  static getOwnerInfo(): BlogOwner {
    return createBlogOwnerFromEnv();
  }

  /**
   * Extract auth token from request headers or cookies
   */
  static extractAuthToken(headers: Headers, cookies?: Map<string, string>): string | undefined {
    // Check Authorization header
    const authHeader = headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check admin_auth cookie
    const authCookie = cookies?.get('admin_auth');
    if (authCookie) {
      return authCookie;
    }

    return undefined;
  }

  /**
   * Verify if request is authenticated
   */
  static isAuthenticated(headers: Headers, cookies?: Map<string, string>): boolean {
    const token = this.extractAuthToken(headers, cookies);
    return this.verifyAdminSecret(token);
  }
}
