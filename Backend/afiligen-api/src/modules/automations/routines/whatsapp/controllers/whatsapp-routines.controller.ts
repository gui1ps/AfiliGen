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
import { UpdateWhatsappRoutineDto } from '../dtos/update-whatsapp-routine.dto';
import { WhatsappRoutineFiltersDto } from '../dtos/whatsapp-routine-filters.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { GetUser } from 'src/modules/auth/decorators/get-user.decorator';

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
  async findAll(
    @Query() filters: WhatsappRoutineFiltersDto,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.routinesService.findAll(userUuid, filters);
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
    @Body() dto: UpdateWhatsappRoutineDto,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.routinesService.update(userUuid, id, dto);
  }

  @Delete(':id')
  @Roles('user')
  async remove(@Param('id') id: number, @GetUser('userUuid') userUuid: string) {
    return this.routinesService.remove(userUuid, id);
  }
}
