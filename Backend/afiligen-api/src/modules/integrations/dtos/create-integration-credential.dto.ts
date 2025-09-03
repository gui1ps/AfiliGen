import { IsString, IsNumber } from 'class-validator';

export class CreateIntegrationCredentialDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
