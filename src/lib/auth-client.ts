/**
 * Client-side authentication utility
 */
export class AuthClient {
  /**
   * Check if user is authenticated by calling API
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get auth token from cookie
   */
  static getAuthToken(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('admin_auth='));

    if (!authCookie) {
      return null;
    }

    return authCookie.split('=')[1];
  }

  /**
   * Check if auth token exists (quick check without API call)
   */
  static hasAuthToken(): boolean {
    return this.getAuthToken() !== null;
  }
}
