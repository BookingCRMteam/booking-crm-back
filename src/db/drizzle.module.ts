import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schemaImport from './schema/schema';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PoolConfig } from 'pg'; // тип конфігурації
type SchemaType = Record<string, AnyPgTable>;
const schema = schemaImport as unknown as SchemaType;
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
      ): NodePgDatabase<SchemaType> => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not set in environment variables.');
        }
        const poolConfig: PoolConfig = {
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
        };

        const pool = new Pool(poolConfig);

        return drizzle<SchemaType>(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_CLIENT'],
})
export class DrizzleModule {}
