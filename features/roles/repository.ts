import { appApi, unwrap } from '@/lib/api';
import { Role, RoleDto, RoleInput, RolesList, Pagination } from './types';
import { toRole, toRolesList, toDtoInput } from './mapper';

export type ListParams = { page?: number; limit?: number; search?: string };

export interface RolesRepository {
  list(params?: ListParams): Promise<RolesList>;
  get(id: number): Promise<Role>;
  create(body: RoleInput): Promise<Role>;
  update(id: number, body: Partial<RoleInput>): Promise<Role>;
  delete(id: number): Promise<void>;
}

export class HttpRolesRepository implements RolesRepository {
  async list(params?: ListParams): Promise<RolesList> {
    const { page = 1, limit = 20, search } = params ?? {};
    const q = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}) });
    const res = await unwrap<{ data: RoleDto[]; pagination: Pagination }>(appApi.get(`/roles?${q.toString()}`));
    return toRolesList(res);
  }

  async get(id: number): Promise<Role> {
    return toRole(await unwrap<RoleDto>(appApi.get(`/roles/${id}`)));
  }

  async create(body: RoleInput): Promise<Role> {
    return toRole(await unwrap<RoleDto>(appApi.post('/roles', toDtoInput(body))));
  }

  async update(id: number, body: Partial<RoleInput>): Promise<Role> {
    return toRole(await unwrap<RoleDto>(appApi.put(`/roles/${id}`, toDtoInput(body as RoleInput))));
  }

  async delete(id: number): Promise<void> {
    await unwrap(appApi.delete(`/roles/${id}`));
  }
}

export const defaultRolesRepository: RolesRepository = new HttpRolesRepository();
