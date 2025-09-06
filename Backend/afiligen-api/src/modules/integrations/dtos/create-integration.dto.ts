import {
  IsString,
  IsIn,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIntegrationCredentialDto } from './create-integration-credential.dto';

export class CreateIntegrationDto {
  @IsIn(['social', 'marketplace'])
  type: 'social' | 'marketplace';

  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateIntegrationCredentialDto)
  credentials?: CreateIntegrationCredentialDto[];
}
