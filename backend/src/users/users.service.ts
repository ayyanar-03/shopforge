import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import type { IUserRepository } from './repositories/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }
}
