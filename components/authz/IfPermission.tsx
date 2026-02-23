import React from 'react';
import { hasPermission, hasAnyPermission } from '@/lib/authz';

export type IfPermissionProps = {
  name?: string;
  anyOf?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function IfPermission({ name, anyOf, children, fallback = null }: IfPermissionProps) {
  const allowed = Array.isArray(anyOf) && anyOf.length > 0 ? hasAnyPermission(anyOf) : name ? hasPermission(name) : true;
  return <>{allowed ? children : fallback}</>;
}
