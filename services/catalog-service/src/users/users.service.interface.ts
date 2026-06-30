import type { SignupDto } from './dto/signup.dto';
import type { LoginDto } from './dto/login.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';

export const USERS_SERVICE = Symbol('USERS_SERVICE');

export interface IUsersService {
  signup(dto: SignupDto): Promise<unknown>;
  login(dto: LoginDto): Promise<unknown>;
  refresh(refreshToken: string): Promise<unknown>;
  logout(refreshToken: string): Promise<void>;
  getProfile(userId: number): Promise<unknown>;
  updateProfile(userId: number, dto: UpdateProfileDto): Promise<unknown>;
  changePassword(userId: number, dto: ChangePasswordDto): Promise<void>;
}
