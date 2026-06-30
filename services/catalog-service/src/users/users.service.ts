import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import type { IUserRepository } from './repositories/user.repository.interface';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  private generateAccessToken(user: { id: number; email: string; role: string }) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const refreshToken = this.refreshTokenRepo.create({ token, userId, expiresAt });
    await this.refreshTokenRepo.save(refreshToken);
    return token;
  }

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const stored = await this.refreshTokenRepo.findOne({
      where: { token, revoked: false },
      relations: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.refreshTokenRepo.update({ userId: stored.userId }, { revoked: true });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    stored.revoked = true;
    await this.refreshTokenRepo.save(stored);

    const accessToken = this.generateAccessToken(stored.user);
    const refreshToken = await this.generateRefreshToken(stored.userId);
    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    await this.refreshTokenRepo.update({ token }, { revoked: true });
  }

  async cleanupExpiredTokens() {
    await this.refreshTokenRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.name = dto.name;
    const saved = await this.userRepo.save(user);
    return { id: saved.id, name: saved.name, email: saved.email, role: saved.role };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
  }
}
