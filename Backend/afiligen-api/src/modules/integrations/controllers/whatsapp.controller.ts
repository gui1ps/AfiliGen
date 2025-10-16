import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { GetUser } from 'src/modules/auth/decorators/get-user.decorator';
import { WhatsappService } from '../services/strategies/whatsapp.strategy';
import { SendMessageDto } from '../dtos/whatsapp-message.dto';

@Controller('integrations/whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}
  @Get('connect')
  @Roles('user')
  async newClient(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.connect(userUuid);
  }

  @Get('disconnect')
  @Roles('user')
  async disconnect(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.disconnect(userUuid);
  }

  @Get('chats')
  @Roles('user')
  async getChats(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.getChats(userUuid);
  }

  @Post('message')
  @Roles('user')
  async sendMessage(
    @GetUser('userUuid') userUuid: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.whatsappService.sendMessage(userUuid, dto);
  }
}
