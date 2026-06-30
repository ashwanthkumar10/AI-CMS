import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role, User } from 'src/users/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard , RolesGuard)
  @Roles(Role.ADMIN)
  profile(@CurrentUser() user: User) {
    return this.authService.profile(user);
  }
}
