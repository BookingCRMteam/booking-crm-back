// src/drizzle/drizzle.module.ts
import { Module, Global } from '@nestjs/common';
import { db } from '../index';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CLIENT',
      useValue: db,
    },
  ],
  exports: ['DRIZZLE_CLIENT'],
})
export class DrizzleModule {}
