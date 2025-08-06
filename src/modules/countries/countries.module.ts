import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService, NodePgDatabase],
})
export class CountriesModule {}
