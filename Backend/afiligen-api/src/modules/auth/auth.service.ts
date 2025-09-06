import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { User } from '../users/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email, true);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(loginUserDto.email, true);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role || 'user',
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(
      registerUserDto.email,
      false,
    );
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return await this.usersService.create({
      ...registerUserDto,
      role: 'user',
      provider: 'local',
    });
  }

  async socialLogin(profile: {
    email: string;
    name: string;
    provider: string;
  }): Promise<{ access_token: string }> {
    let user = await this.usersService.findByEmail(profile.email, false);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        password: null,
        provider: profile.provider,
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
