import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CreateWhatsappBlockDto } from '../dtos/create-whatsapp-block.dto';
import { CreateWhatsappMessageDto } from '../dtos/create-whatsapp-message.dto';
import { WhatsappRoutineBlocksService } from '../services/whatsapp-routine-block.service';
import { UpdateWhatsappBlockDto } from '../dtos/update-whatsapp-block.dto';

@Controller('automations/whatsapp/blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsappRoutinesBlocksController {
  constructor(
    private readonly routinesBlocksService: WhatsappRoutineBlocksService,
  ) {}

  @Post()
  @Roles('user')
  async create(@Body() dto: CreateWhatsappBlockDto) {
    return this.routinesBlocksService.create(dto);
  }

  @Patch(':id')
  @Roles('user')
  async update(@Param('id') id: number, @Body() dto: UpdateWhatsappBlockDto) {
    return this.routinesBlocksService.update(id, dto);
  }

  @Delete(':id')
  @Roles('user')
  async remove(@Param('id') id: number) {
    return this.routinesBlocksService.remove(id);
  }

  @Post(':blockId/messages')
  addMessage(
    @Param('blockId') blockId: number,
    @Body() dto: CreateWhatsappMessageDto,
  ) {
    return this.routinesBlocksService.addMessage(blockId, dto);
  }

  @Get(':blockId/messages')
  getMessages(@Param('blockId') blockId: number) {
    return this.routinesBlocksService.getMessages(blockId);
  }
}
