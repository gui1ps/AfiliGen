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
import { GetUser } from 'src/modules/auth/decorators/get-user.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @Roles('user')
  async createIntegration(
    @GetUser('userUuid') userUuid: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(userUuid, dto);
  }

  @Post(':id/credentials')
  @Roles('user')
  async addCredential(
    @Param('id', ParseIntPipe) integrationId: number,
    @Body() dto: CreateIntegrationCredentialDto,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.integrationsService.addCredential(userUuid, integrationId, dto);
  }

  @Patch(':id/credentials')
  @Roles('user')
  async updateCredential(
    @Param('id', ParseIntPipe) integrationId: number,
    @Body() dto: UpdateIntegrationCredentialDto,
    @GetUser('userUuid') userUuid: string,
  ) {
    return this.integrationsService.updateCredential(
      userUuid,
      integrationId,
      dto,
    );
  }

  @Patch(':id')
  @Roles('user')
  async updateIntegrationStatus(
    @GetUser('userUuid') userUuid: string,
    @Param('id', ParseIntPipe) integrationId: number,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.updateIntegrationStatus(
      userUuid,
      integrationId,
      dto,
    );
  }

  @Get()
  @Roles('user')
  async getUserIntegrations(@GetUser('userUuid') userUuid: string) {
    return this.integrationsService.getUserIntegrations(userUuid);
  }

  @Get(':id')
  @Roles('user')
  async getUserIntegration(
    @GetUser('userUuid') userUuid: string,
    @Param('id', ParseIntPipe) integrationId: number,
  ) {
    return this.integrationsService.getUserIntegration(userUuid, integrationId);
  }
}
