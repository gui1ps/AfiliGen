import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSalt, hash } from 'bcrypt';
import zxcvbn from 'zxcvbn';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return null;
    return user;
  }

  async findOne(uuid: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ uuid });
    if (!user) throw new NotFoundException(`User with uuid ${uuid} not found`);
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const provider = createUserDto.provider || 'local';
    if (provider === 'local') {
      if (createUserDto.password) {
        const { score } = zxcvbn(createUserDto.password);
        if (score < 3) {
          throw new BadRequestException('Password is too weak');
        } else {
          const salt = await genSalt();
          createUserDto.password = await hash(createUserDto.password, salt);
        }
      } else {
        throw new BadRequestException('Password is required');
      }
    } else {
      createUserDto.password = null;
    }

    const user = this.userRepository.create({
      ...createUserDto,
      provider,
      role: createUserDto.role || 'user',
    });

    return this.userRepository.save(user);
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ uuid });
    if (!user) throw new NotFoundException(`User with uuid ${uuid} not found`);
    if (updateUserDto.password) {
      const salt = await genSalt();
      updateUserDto.password = await hash(updateUserDto.password, salt);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(uuid: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ uuid });
    if (!user) throw new NotFoundException(`User with uuid ${uuid} not found`);
    await this.userRepository.remove(user);
  }
}
