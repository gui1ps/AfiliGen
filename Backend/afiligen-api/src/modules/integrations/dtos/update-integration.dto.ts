import { IsIn, IsString } from 'class-validator';

export class UpdateIntegrationDto {
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}
