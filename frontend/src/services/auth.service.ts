import api from '../api';
import type { AuthResponse, User } from '../types/user.types';

export const authService = {
  signup: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { name, email, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  getProfile: () =>
    api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (data: { name?: string }) =>
    api.patch<User>('/auth/me', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/me/password', { currentPassword, newPassword }),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};
