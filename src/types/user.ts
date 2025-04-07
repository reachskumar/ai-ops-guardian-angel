
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  email?: string;  // Adding email for convenience
  last_login?: string; // Adding last login tracking
}
