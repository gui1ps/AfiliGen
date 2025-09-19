import { IsOptional, IsString, IsIn } from 'class-validator';

export class WhatsappRoutineFiltersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['active', 'paused', 'finished'])
  status?: 'active' | 'paused' | 'finished';
}
