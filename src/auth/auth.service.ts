import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';

import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, displayName, role, bio, avatarUrl } =
        registerDto;

      const existingUser = await this.userRepository.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = this.userRepository.create({
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        displayName,
        role,
        bio,
        avatarUrl,
      });

      const savedUser = await this.userRepository.save(user);

      const { passwordHash, ...userResponse } = savedUser;

      return {
        message: 'User registered successfully.',
        data: userResponse,
      };
    } catch (error) {
      this.logger.error(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while registering the user.',
      );
    }
  }

 async login(loginDto: LoginDto) {
  try {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { passwordHash, ...userResponse } = user;

    return {
      message: 'Login successful.',
      data: {
        accessToken,
        user: userResponse,
      },
    };
  } catch (error) {
    this.logger.error(error);

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Something went wrong while logging in.',
    );
  }
 }

 async profile(user: User) {
  try {
    const { passwordHash, ...userResponse } = user;

    return {
      message: 'Profile fetched successfully.',
      data: userResponse,
    };
  } catch (error) {
    this.logger.error(error);

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Something went wrong while fetching profile.',
    );
  }
}
}