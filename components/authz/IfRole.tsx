import React from 'react';
import { hasRole, hasAnyRole } from '@/lib/authz';

export type IfRoleProps = {
  name?: string;
  anyOf?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function IfRole({ name, anyOf, children, fallback = null }: IfRoleProps) {
  const allowed = Array.isArray(anyOf) && anyOf.length > 0 ? hasAnyRole(anyOf) : name ? hasRole(name) : true;
  return <>{allowed ? children : fallback}</>;
}
