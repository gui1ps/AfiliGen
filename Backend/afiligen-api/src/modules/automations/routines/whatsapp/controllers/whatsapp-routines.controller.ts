import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WhatsappRoutinesService } from '../services/whatsapp-routines.service';
import { CreateWhatsappRoutineDto } from '../dtos/create-whatsapp-routine.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { GetUser } from 'src/modules/auth/decorators/get-user.decorator';
import { CreateWhatsappMessageDto } from '../dtos/create-whatsapp-message.dto';
import { UpdateWhatsappMessageDto } from '../dtos/update-whatsapp-message.dto';

@Controller('automations/whatsapp/routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsappRoutinesController {
  constructor(private readonly routinesService: WhatsappRoutinesService) {}

  @Post()
  @Roles('user')
  async createRoutine(
    @GetUser('userUuid') userUuid: string,
    @Body() dto: CreateWhatsappRoutineDto,
  ) {
    return this.routinesService.create(userUuid, dto);
  }

  @Get()
  @Roles('user')
  async findAll(@GetUser('userUuid') userUuid: string) {
    return this.routinesService.findAll(userUuid);
  }

  @Get(':id')
  @Roles('user')
  async findOne(
    @Param('id') id: number,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.routinesService.findOne(userUuid, id);
  }

  @Patch(':id')
  @Roles('user')
  async update(
    @Param('id') id: number,
    @Body() dto: Partial<CreateWhatsappRoutineDto>,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.routinesService.update(userUuid, id, dto);
  }

  @Delete(':id')
  @Roles('user')
  async remove(@Param('id') id: number, @GetUser('userUuid') userUuid: string) {
    return this.routinesService.remove(userUuid, id);
  }

  @Get(':id/blocks')
  @Roles('user')
  getBlocks(@Param('id') routineId: number) {
    return this.routinesService.getBlocks(routineId);
  }

  @Post(':id/messages')
  @Roles('user')
  addMessage(
    @Param('id') routineId: number,
    @GetUser('userUuid') userUuid: string,
    @Body() dto: CreateWhatsappMessageDto,
  ) {
    return this.routinesService.addMessage(userUuid, routineId, dto);
  }

  @Patch(':routineId/messages/:messageId')
  @Roles('user')
  updateMessage(
    @Param('routineId') routineId: number,
    @Param('messageId') messageId: number,
    @GetUser('userUuid') userUuid: string,
    @Body() dto: UpdateWhatsappMessageDto,
  ) {
    return this.routinesService.updateMessage(
      userUuid,
      routineId,
      messageId,
      dto,
    );
  }

  @Delete(':routineId/messages/:messageId')
  @Roles('user')
  removeMessage(
    @Param('routineId') routineId: number,
    @Param('messageId') messageId: number,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.routinesService.removeMessage(userUuid, routineId, messageId);
  }
}
