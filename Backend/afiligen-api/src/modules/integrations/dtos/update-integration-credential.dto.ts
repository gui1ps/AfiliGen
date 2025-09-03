import { IsString, IsOptional } from 'class-validator';

export class UpdateIntegrationCredentialDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
