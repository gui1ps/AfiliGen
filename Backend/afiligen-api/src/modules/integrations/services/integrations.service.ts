import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../entities/integration.entity';
import { IntegrationCredential } from '../entities/integration-credentials.entity';
import { CreateIntegrationDto } from '../dtos/create-integration.dto';
import { UpdateIntegrationDto } from '../dtos/update-integration.dto';
import { UpdateIntegrationCredentialDto } from '../dtos/update-integration-credential.dto';
import { CreateIntegrationCredentialDto } from '../dtos/create-integration-credential.dto';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepo: Repository<Integration>,
    @InjectRepository(IntegrationCredential)
    private credentialsRepo: Repository<IntegrationCredential>,
    private usersService: UserService,
  ) {}

  async create(newIntegration: CreateIntegrationDto): Promise<Integration> {
    const user = await this.usersService.findOne(newIntegration.user_uuid);
    if (!user)
      throw new NotFoundException(
        `User with uuid ${newIntegration.user_uuid} not found`,
      );
    if (!newIntegration.status) {
      newIntegration.status = 'active';
    }
    let integration: Integration | null =
      this.integrationRepo.create(newIntegration);
    const savedIntegration = await this.integrationRepo.save(integration);

    if (newIntegration.credentials && newIntegration.credentials.length > 0) {
      for (const credential of newIntegration.credentials) {
        await this.addCredential(savedIntegration.id, credential);
      }
    }

    integration = await this.integrationRepo.findOne({
      where: { id: savedIntegration.id },
      relations: ['credentials'],
    });

    if (!integration) {
      throw new NotFoundException('Unable to update create this integration');
    }

    return integration;
  }

  async addCredential(
    integrationId: number,
    credentialData: CreateIntegrationCredentialDto,
  ): Promise<IntegrationCredential> {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    const key = credentialData.key;
    const value = credentialData.value;
    const credential = this.credentialsRepo.create({ integration, key, value });
    return this.credentialsRepo.save(credential);
  }

  async updateCredential(
    integrationId: number,
    newCredentialValue: UpdateIntegrationCredentialDto,
  ): Promise<Integration> {
    let integration: Integration | null = await this.integrationRepo.findOne({
      where: { id: integrationId },
      relations: ['credentials'],
    });
    if (!integration) throw new NotFoundException('Integration not found');
    if (!integration.credentials || integration.credentials.length === 0)
      throw new NotFoundException(
        'There are no credentials for this integration',
      );
    const credentialKey = newCredentialValue.key;
    const credentialValue = newCredentialValue.value;

    const credential = integration.credentials.find((cred) => {
      return cred.key === newCredentialValue.key;
    });
    if (!credential) {
      throw new NotFoundException(
        `Credential with key "${credentialKey}" not found`,
      );
    }
    if (!credentialValue)
      throw new NotFoundException('There is no value to be updated');
    credential.value = credentialValue;
    await this.credentialsRepo.save(credential);

    integration = await this.integrationRepo.findOne({
      where: { id: integrationId },
      relations: ['credentials'],
    });

    if (!integration) {
      throw new NotFoundException(
        'Unable to update credentials for this integration',
      );
    }

    return integration;
  }

  async updateIntegrationStatus(
    updateData: UpdateIntegrationDto,
  ): Promise<Integration> {
    const integration = await this.integrationRepo.findOne({
      where: { id: updateData.id },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    integration.status = updateData.status;
    return this.integrationRepo.save(integration);
  }

  async getUserIntegrations(userId: number): Promise<Integration[]> {
    return this.integrationRepo.find({
      where: { user: { id: userId } },
      relations: ['credentials'],
    });
  }
}
