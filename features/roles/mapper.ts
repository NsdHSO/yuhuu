import { Role, RoleDto, RolesList, Pagination, RoleInput } from './types';

export function parsePermissions(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

export function toRole(dto: RoleDto): Role {
  return { ...dto, permissions: parsePermissions(dto.permissions) };
}

export function toRolesList(res: { data: RoleDto[]; pagination: Pagination }): RolesList {
  return { data: res.data.map(toRole), pagination: res.pagination };
}

export function toDtoInput(body: RoleInput) {
  return { ...body, permissions: JSON.stringify(body.permissions ?? []) };
}
