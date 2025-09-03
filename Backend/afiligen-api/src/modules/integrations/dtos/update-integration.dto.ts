import { IsNumber, IsString } from 'class-validator';

export class UpdateIntegrationDto {
  @IsNumber()
  id: number;

  @IsString()
  status: string;
}
