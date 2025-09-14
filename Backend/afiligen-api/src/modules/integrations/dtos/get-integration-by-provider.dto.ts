import { IsString } from 'class-validator';

export class GetIntegrationByProviderDto {
  @IsString()
  provider: string;
}
