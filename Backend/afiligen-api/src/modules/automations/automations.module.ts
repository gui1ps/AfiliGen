import { Module } from '@nestjs/common';
import { RoutinesModule } from './routines/routines.module';

@Module({
  imports: [RoutinesModule],
  providers: [],
  controllers: [],
  exports: [RoutinesModule],
})
export class AutomationsModule {}
