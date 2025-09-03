import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';
import { IntegrationCredential } from './entities/integration-credentials.entity';
import { IntegrationsService } from './services/integrations.service';
import { IntegrationsController } from './controllers/integrations.controller';
import { UserModule } from 'src/modules/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, IntegrationCredential]),
    UserModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
