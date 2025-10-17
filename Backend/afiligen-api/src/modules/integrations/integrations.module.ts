import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';
import { IntegrationCredential } from './entities/integration-credentials.entity';
import { IntegrationsService } from './services/integrations.service';
import { IntegrationsController } from './controllers/integrations.controller';
import { UserModule } from 'src/modules/users/user.module';
import { WhatsappService } from './services/strategies/whatsapp.strategy';
import { WhatsappController } from './controllers/whatsapp.controller';
import { WhatsappMessage } from '../automations/routines/whatsapp/entities/whatsapp-message.entity.ts';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Integration,
      IntegrationCredential,
      WhatsappMessage,
    ]),
    UserModule,
    AuthModule,
  ],
  controllers: [IntegrationsController, WhatsappController],
  providers: [IntegrationsService, WhatsappService],
  exports: [IntegrationsService, WhatsappService],
})
export class IntegrationsModule {}
