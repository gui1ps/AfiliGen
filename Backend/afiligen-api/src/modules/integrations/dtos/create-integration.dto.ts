import { IsString, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIntegrationCredentialDto } from './create-integration-credential.dto';

export class CreateIntegrationDto {
  @IsString()
  user_uuid: string;

  @IsIn(['social', 'marketplace'])
  type: 'social' | 'marketplace';

  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateIntegrationCredentialDto)
  credentials?: CreateIntegrationCredentialDto[];
}
