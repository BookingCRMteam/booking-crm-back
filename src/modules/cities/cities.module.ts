import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, NodePgDatabase],
})
export class CitiesModule {}
