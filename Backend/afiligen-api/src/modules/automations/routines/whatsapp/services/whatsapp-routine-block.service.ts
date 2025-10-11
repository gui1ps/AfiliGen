import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappRoutine } from '../entities/whatsapp-routine.entity';
import { WhatsappMessage } from '../entities/whatsapp-message.entity.ts';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { CreateWhatsappBlockDto } from '../dtos/create-whatsapp-block.dto';
import { CreateWhatsappMessageDto } from '../dtos/create-whatsapp-message.dto';
import { UpdateWhatsappBlockDto } from '../dtos/update-whatsapp-block.dto';

@Injectable()
export class WhatsappRoutineBlocksService {
  constructor(
    @InjectRepository(WhatsappRoutine)
    private routineRepo: Repository<WhatsappRoutine>,

    @InjectRepository(WhatsappRoutineBlock)
    private readonly blockRepo: Repository<WhatsappRoutineBlock>,

    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
  ) {}

  async create(dto: CreateWhatsappBlockDto) {
    const routine = await this.routineRepo.findOne({
      where: { id: dto.routineId },
      relations: ['chatAppMessageBlock'],
    });
    if (!routine) throw new NotFoundException('Routine not found');
    const routineBlocks = routine.chatAppMessageBlock;
    if (routineBlocks.length > 0) {
      const newBlockTriggerTime = new Date(dto.triggerTime);
      let existingBlockTriggerTime: Date;
      for (const block of routineBlocks) {
        existingBlockTriggerTime = new Date(block.triggerTime);
        if (
          newBlockTriggerTime.getTime() === existingBlockTriggerTime.getTime()
        ) {
          throw new BadRequestException(
            'A block with the same trigger time already exists',
          );
        }
      }
    }
    const block = this.blockRepo.create({ ...dto, routine });
    return this.blockRepo.save(block);
  }

  async update(id: number, dto: UpdateWhatsappBlockDto) {
    const block = await this.blockRepo.findOneBy({ id });
    if (!block) throw new NotFoundException('Block not found!');
    Object.assign(block, dto);
    return this.blockRepo.save(block);
  }

  async remove(id: number) {
    const block = await this.blockRepo.findOneBy({ id });
    if (!block) throw new NotFoundException('Block not found!');
    return this.blockRepo.remove(block);
  }

  async addMessage(id: number, dto: CreateWhatsappMessageDto) {
    const block = await this.blockRepo.findOneBy({ id });
    if (!block) throw new NotFoundException('Block not found');

    const message = this.messageRepo.create({ ...dto, block });
    return this.messageRepo.save(message);
  }

  async getMessages(id: number) {
    const block = await this.blockRepo.findOneBy({ id: id });
    if (!block) throw new NotFoundException('Block not found');
    return this.messageRepo.find({
      where: { block: { id } },
    });
  }
}
