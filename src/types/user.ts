
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  email?: string;  // Adding email for convenience
  last_login?: string; // Adding last login tracking
  last_active?: string; // Track when user was last active on dashboard
  metrics_access_level?: 'basic' | 'advanced' | 'admin'; // Control what metrics are visible
}
