import { Body, Controller, Get, Post } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('users')
  async getHealhUsers() {
    return this.healthService.getHealhUsers();
  }

  @Post('users')
  async createHealthUser(@Body() data: { name: string; email: string }) {
    return this.healthService.createHealthUser(data.name, data.email);
  }
}
