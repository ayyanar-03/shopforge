import api from '../api';
import type { AdminStats } from '../types/user.types';
import type { PagedResponse } from '../types/common.types';
import type { User } from '../types/user.types';

export const adminService = {
  getStats: () =>
    api.get<AdminStats>('/admin/stats').then((r) => r.data),

  getUsers: (page: number, limit = 20) =>
    api.get<PagedResponse<User>>('/admin/users', { params: { page, limit } }).then((r) => r.data),
};
