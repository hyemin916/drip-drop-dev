// BlogOwner interface
export interface BlogOwner {
  name: string;
  email: string | null;
  isAuthenticated: boolean;
}

// Authentication context
export interface AuthContext {
  owner: BlogOwner | null;
  secret: string;
}

// Helper function to create blog owner from environment
export function createBlogOwnerFromEnv(): BlogOwner {
  return {
    name: process.env.OWNER_NAME || 'Blog Owner',
    email: process.env.OWNER_EMAIL || null,
    isAuthenticated: false,
  };
}

// Helper function to validate admin secret
export function validateAdminSecret(secret: string | undefined): boolean {
  if (!secret || secret.length < 32) {
    return false;
  }
  return true;
}
