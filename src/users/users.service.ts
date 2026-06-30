import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const { email, password, displayName, role, bio, avatarUrl } =
        createUserDto;

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

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while registering the user.',
      );
    }
  }
}