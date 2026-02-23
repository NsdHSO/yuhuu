// Domain and transport types for Roles feature

// Raw shape from API (permissions as JSON string)
export type RoleDto = {
  id: number;
  name: string;
  description?: string | null;
  level: number;
  permissions: string; // JSON string
  created_at: string;
  updated_at: string;
};

// Normalized domain model used by the app
export type Role = Omit<RoleDto, 'permissions'> & { permissions: string[] };

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type RolesList = { data: Role[]; pagination: Pagination };

// Input used by the app
export type RoleInput = {
  name: string;
  level: number;
  description?: string | null;
  permissions: string[];
};