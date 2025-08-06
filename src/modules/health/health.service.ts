import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './health.schema';

@Injectable()
export class HealthService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof schema>,
  ) {}

  getHealth() {
    return 'Healthy!';
  }

  async getHealhUsers() {
    return await this.db.query.health.findMany();
  }

  async createHealthUser(name: string, email: string) {
    const [newUser] = await this.db
      .insert(schema.health)
      .values({ name, email })
      .returning();
    return newUser;
  }
}
