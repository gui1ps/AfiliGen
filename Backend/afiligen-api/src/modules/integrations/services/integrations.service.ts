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
import { ConflictException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepo: Repository<Integration>,
    @InjectRepository(IntegrationCredential)
    private credentialsRepo: Repository<IntegrationCredential>,
    private usersService: UserService,
  ) {}

  async create(
    userUuid: string,
    newIntegration: CreateIntegrationDto,
  ): Promise<Integration> {
    const user = await this.usersService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);
    if (!newIntegration.status) {
      newIntegration.status = 'active';
    }
    let integration: Integration | null = this.integrationRepo.create({
      ...newIntegration,
      user,
    });
    const savedIntegration = await this.integrationRepo.save(integration);

    if (newIntegration.credentials && newIntegration.credentials.length > 0) {
      for (const credential of newIntegration.credentials) {
        await this.addCredential(userUuid, savedIntegration.id, credential);
      }
    }

    integration = await this.integrationRepo.findOne({
      where: { id: savedIntegration.id },
      relations: ['credentials', 'user'],
    });

    if (!integration) {
      throw new NotFoundException('Unable to update create this integration');
    }

    return integration;
  }

  async addCredential(
    userUuid: string,
    integrationId: number,
    credentialData: CreateIntegrationCredentialDto,
  ): Promise<IntegrationCredential> {
    const user = await this.usersService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId, user: { id: user.id } },
      relations: ['credentials'],
    });
    if (!integration) throw new NotFoundException('Integration not found');
    const currentCredentialsKeys = integration.credentials?.map((cred) => {
      return cred.key;
    });
    const key = credentialData.key;
    if (key.length < 1) {
      throw new NotFoundException('There is no key for this credential');
    }
    if (currentCredentialsKeys.includes(key))
      throw new ConflictException(
        'There is already a credential with this key registered for this integration',
      );
    const value = credentialData.value;
    if (value.length < 1) {
      throw new NotFoundException('There is no value for this credential');
    }
    const credential = this.credentialsRepo.create({ integration, key, value });
    return this.credentialsRepo.save(credential);
  }

  async updateCredential(
    userUuid: string,
    integrationId: number,
    newCredentialValue: UpdateIntegrationCredentialDto,
  ): Promise<Integration> {
    const user = await this.usersService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);
    let integration = await this.integrationRepo.findOne({
      where: { id: integrationId, user: { id: user.id } },
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
    userUuid: string,
    integrationId: number,
    dto: UpdateIntegrationDto,
  ): Promise<Integration> {
    const user = await this.usersService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId, user: { id: user.id } },
      relations: ['credentials'],
    });
    if (!integration) throw new NotFoundException('Integration not found');
    integration.status = dto.status;
    return this.integrationRepo.save(integration);
  }

  async getUserIntegrations(userUuid: string): Promise<Integration[]> {
    const integrations = await this.integrationRepo.find({
      where: { user: { uuid: userUuid } },
      relations: ['credentials'],
    });
    if (!integrations)
      throw new NotFoundException(
        'There are no integrations available for this user.',
      );
    return integrations;
  }

  async getUserIntegration(
    userUuid: string,
    integrationId?: number,
    provider?: string,
  ): Promise<Integration> {
    if (integrationId != undefined) {
      const integration = await this.integrationRepo.findOne({
        where: { user: { uuid: userUuid }, id: integrationId },
        relations: ['credentials'],
      });
      if (!integration)
        throw new NotFoundException(
          `Integration not found for id ${integrationId}`,
        );
      return integration;
    } else if (provider) {
      const integration = await this.integrationRepo.findOne({
        where: { user: { uuid: userUuid }, provider },
        relations: ['credentials'],
      });
      if (!integration) {
        throw new NotFoundException(
          `Integration not found for provider ${provider}`,
        );
      }
      return integration;
    } else {
      throw new BadRequestException('IntegrationId or byType not provided');
    }
  }

  async getIntegrationCredentialsAsObject<T>(
    userUuid: string,
    integrationId: number,
  ): Promise<T> {
    const integration = await this.getUserIntegration(userUuid, integrationId);

    if (!integration) {
      throw new NotFoundException(
        `Integration with id ${integrationId} not found`,
      );
    }

    if (!integration.credentials || integration.credentials.length === 0) {
      throw new NotFoundException(
        `No credentials found for integration ${integrationId}`,
      );
    }

    const credentialsObject = integration.credentials.reduce(
      (acc, cred) => {
        acc[cred.key] = cred.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return credentialsObject as T;
  }
}
