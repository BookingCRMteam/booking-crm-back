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
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not set in environment variables.');
        }

        const pool: Pool = new Pool({
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
        });

        if (!pool) {
          throw new Error('Failed to create pool');
        }

        return drizzle<typeof schema>(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_CLIENT'],
})
export class DrizzleModule {}
