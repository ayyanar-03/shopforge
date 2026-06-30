import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmUserRepository } from './repositories/user.repository';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { USERS_SERVICE } from './users.service.interface';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'shopforge-dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [UsersController],
  providers: [
    { provide: USERS_SERVICE, useClass: UsersService },
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [
    USERS_SERVICE,
    JwtModule,
    PassportModule,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
})
export class UsersModule {}
