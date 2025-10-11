import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappRoutine } from '../entities/whatsapp-routine.entity';
import { CreateWhatsappRoutineDto } from '../dtos/create-whatsapp-routine.dto';
import { UpdateWhatsappRoutineDto } from '../dtos/update-whatsapp-routine.dto';
import { WhatsappRoutineFiltersDto } from '../dtos/whatsapp-routine-filters.dto';
import { UserService } from 'src/modules/users/user.service';
import { WhatsappMessage } from '../entities/whatsapp-message.entity.ts';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { CreateWhatsappBlockDto } from '../dtos/create-whatsapp-block.dto';
import { CreateWhatsappMessageDto } from '../dtos/create-whatsapp-message.dto';

@Injectable()
export class WhatsappRoutinesService {
  constructor(
    @InjectRepository(WhatsappRoutine)
    private routineRepo: Repository<WhatsappRoutine>,
    private readonly userService: UserService,

    @InjectRepository(WhatsappRoutineBlock)
    private readonly blockRepo: Repository<WhatsappRoutineBlock>,

    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
  ) {}

  async create(
    userUuid: string,
    dto: CreateWhatsappRoutineDto,
  ): Promise<WhatsappRoutine> {
    const user = await this.userService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);

    const startDate = new Date(dto.startAt);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('startAt must be greater than now');
    }

    if (!dto.status) {
      dto.status = 'active';
    }

    if (dto.endAt) {
      const endDate = new Date(dto.endAt);
      if (endDate <= startDate) {
        throw new BadRequestException('endAt must be greater than startAt');
      }
    }

    let routine: WhatsappRoutine | null;

    routine = this.routineRepo.create({
      ...dto,
      user,
    });

    const saved = await this.routineRepo.save(routine);

    routine = await this.routineRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'messages'],
    });

    if (!routine) {
      throw new NotFoundException('Unable to create this routine');
    }

    return routine;
  }

  async findAll(
    userUuid: string,
    filters: WhatsappRoutineFiltersDto,
  ): Promise<WhatsappRoutine[]> {
    const qb = this.routineRepo
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.user', 'user')
      .where('user.uuid = :userUuid', { userUuid });

    if (filters.name) {
      qb.andWhere('routine.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.status) {
      qb.andWhere('routine.status = :status', { status: filters.status });
    }

    return qb.getMany();
  }

  async findOne(userUuid: string, id: number): Promise<WhatsappRoutine> {
    const routine = await this.routineRepo.findOne({
      where: { id, user: { uuid: userUuid } },
      relations: ['user', 'messages'],
    });

    if (!routine) throw new NotFoundException(`Routine ${id} not found`);

    return routine;
  }

  async update(
    userUuid: string,
    id: number,
    dto: UpdateWhatsappRoutineDto,
  ): Promise<WhatsappRoutine> {
    const routine = await this.findOne(userUuid, id);
    const today = new Date();

    if (dto.startAt) {
      const currentStartDate = new Date(routine.startAt);
      const newStartDate = new Date(dto.startAt);
      if (newStartDate > currentStartDate && currentStartDate <= today) {
        throw new BadRequestException(
          'It is not possible to postpone the start date of this routine because it is already running.',
        );
      }
    }

    if (dto.endAt) {
      let startDate: Date;
      const endDate = new Date(dto.endAt);

      if (dto.startAt) {
        startDate = new Date(dto.startAt);
        if (endDate <= startDate) {
          throw new BadRequestException(
            'end date must be greater than start date',
          );
        }
      } else {
        startDate = new Date(routine.startAt);
        if (endDate <= startDate) {
          throw new BadRequestException(
            'The current start date is less than or equal to the end date',
          );
        }
      }
    }

    Object.assign(routine, dto);

    await this.routineRepo.save(routine);

    return this.findOne(userUuid, id);
  }

  async remove(userUuid: string, id: number): Promise<void> {
    const routine = await this.findOne(userUuid, id);
    if (!routine) throw new NotFoundException('Routine not found');
    await this.routineRepo.remove(routine);
  }

  async getBlocks(routineId: number) {
    const routine = await this.routineRepo.findOne({
      where: { id: routineId },
    });
    if (!routine) throw new NotFoundException('Routine not found');
    return this.blockRepo.find({
      where: { routine: { id: routineId } },
      relations: ['messages'],
    });
  }

  async addMessage(
    userUuid: string,
    routineId: number,
    message: CreateWhatsappMessageDto,
  ) {
    const user = await this.userService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);

    const routine = await this.routineRepo.findOne({
      where: { id: routineId, user: { uuid: userUuid } },
    });

    if (!routine) throw new NotFoundException(`Routine ${routineId} not found`);

    const entity = this.messageRepo.create({ ...message, routine });
    const createdMessage = await this.messageRepo.save(entity);
    return createdMessage;
  }
}
