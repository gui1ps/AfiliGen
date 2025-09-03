import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':uuid')
  @Roles('admin')
  findOne(@Param('uuid') uuid: string): Promise<User | null> {
    return this.userService.findOne(uuid);
  }

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Patch(':uuid')
  @Roles('admin')
  update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  @Roles('admin')
  remove(@Param('uuid') uuid: string): Promise<void> {
    return this.userService.remove(uuid);
  }
}
