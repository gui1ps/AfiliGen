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
import { IntegrationsService } from '../services/integrations.service';
import { CreateIntegrationDto } from '../dtos/create-integration.dto';
import { UpdateIntegrationDto } from '../dtos/update-integration.dto';
import { UpdateIntegrationCredentialDto } from '../dtos/update-integration-credential.dto';
import { CreateIntegrationCredentialDto } from '../dtos/create-integration-credential.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @Roles('user')
  async createIntegration(@Body() dto: CreateIntegrationDto) {
    return this.integrationsService.create(dto);
  }

  @Post(':id/credentials')
  @Roles('user')
  async addCredential(
    @Param('id', ParseIntPipe) integrationId: number,
    @Body() dto: CreateIntegrationCredentialDto,
  ) {
    return this.integrationsService.addCredential(integrationId, dto);
  }

  @Patch(':id/credentials')
  @Roles('user')
  async updateCredential(
    @Param('id', ParseIntPipe) integrationId: number,
    @Body() dto: UpdateIntegrationCredentialDto,
  ) {
    return this.integrationsService.updateCredential(integrationId, dto);
  }

  @Patch(':id/status')
  @Roles('user')
  async updateIntegrationStatus(@Body() dto: UpdateIntegrationDto) {
    return this.integrationsService.updateIntegrationStatus(dto);
  }

  @Get('user/:userId')
  @Roles('user')
  async getUserIntegrations(@Param('userId', ParseIntPipe) userId: number) {
    return this.integrationsService.getUserIntegrations(userId);
  }
}
