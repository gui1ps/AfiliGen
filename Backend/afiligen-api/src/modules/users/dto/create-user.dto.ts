import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string | null;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
