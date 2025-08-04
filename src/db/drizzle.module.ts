// src/database/database.module.ts (як обговорювалося раніше)
import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: 'DRIZZLE_CLIENT',
      useFactory: (
        configService: ConfigService,
      ): NodePgDatabase<typeof schema> => {
        const databaseUrl = configService.get<string>('DATABASE_URL'); // <-- ConfigService вже краще типізує

        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not set in environment variables.');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const pool = new Pool({
          connectionString: databaseUrl,
          ssl: true,
        });

        if (!pool) {
          throw new Error('Failed to create pool');
        }

        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_CLIENT'],
})
export class DrizzleModule {}
