import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      cache: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DATABASE_HOST'),
        port: Number(cfg.get<string>('DATABASE_PORT') ?? 5432),
        username: cfg.get<string>('DATABASE_USER'),
        password: cfg.get<string>('DATABASE_PASSWORD'),
        database: cfg.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        ssl: {
        rejectUnauthorized: false,
      },
        synchronize: false,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.get<string>('REDIS_URL');
        if (url) {
          return {
            redis: url,
            prefix: cfg.get<string>('BULL_PREFIX') ?? 'afiligen::bull',
          };
        }
        return {
          redis: {
            host: cfg.get<string>('REDIS_HOST') ?? 'redis',
            port: Number(cfg.get<string>('REDIS_PORT') ?? 6379),
            password: cfg.get<string>('REDIS_PASSWORD') || undefined,
          },
          prefix: cfg.get<string>('BULL_PREFIX') ?? 'afiligen::bull',
        };
      },
    }),

    UserModule,
    AuthModule,
    IntegrationsModule,
    AutomationsModule,
  ],
})
export class AppModule {}
