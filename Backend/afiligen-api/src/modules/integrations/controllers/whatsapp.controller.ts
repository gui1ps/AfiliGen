import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
  Sse,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { GetUser } from 'src/modules/auth/decorators/get-user.decorator';
import { WhatsappService } from '../services/strategies/whatsapp.strategy';
import { SendMessageDto } from '../dtos/whatsapp-message.dto';
import { map } from 'rxjs/operators';

@Controller('integrations/whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('connect')
  @Roles('user')
  async newClient(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.connect(userUuid);
  }

  @Get('status')
  @Roles('user')
  async getStatus(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.getStatus(userUuid);
  }

  @Sse('status/stream')
  @Roles('user')
  async sseStatus(@GetUser('userUuid') userUuid: string) {
    const subject = this.whatsappService.getSubject(userUuid);
    return subject.asObservable().pipe(map((status) => ({ data: status })));
  }

  @Get('profile')
  @Roles('user')
  async getProfile(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.getLoggedProfile(userUuid);
  }

  @Get('chats')
  @Roles('user')
  async getChats(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.getChats(userUuid);
  }

  @Get('contacts')
  @Roles('user')
  async getContacts(@GetUser('userUuid') userUuid: string) {
    return this.whatsappService.getContacts(userUuid);
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
