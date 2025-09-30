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
import { UpdateWhatsappBlockDto } from '../dtos/update-whatsapp-block.dto';

@Injectable()
export class WhatsappRoutineBlocksService {
  constructor(
    @InjectRepository(WhatsappRoutineBlock)
    private readonly blockRepo: Repository<WhatsappRoutineBlock>,

    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
  ) {}

  async update(id: number, dto: UpdateWhatsappBlockDto) {
    const block = await this.blockRepo.findOneBy({ id });
    if (!block) throw new NotFoundException('Block not found!');
    Object.assign(block, dto);
    await this.blockRepo.save(block);
  }
}
