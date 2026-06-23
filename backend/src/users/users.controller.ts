import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.usersService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }
}
