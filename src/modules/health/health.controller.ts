import { Body, Controller, Get, Post } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

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
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Add a new health user',
    schema: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'name@example.com' },
      },
    },
  })
  @Post('users')
  async createHealthUser(@Body() data: { name: string; email: string }) {
    return this.healthService.createHealthUser(data.name, data.email);
  }
}
