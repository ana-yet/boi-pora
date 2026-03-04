import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator.js';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class HealthController {
  @Public()
  @SkipThrottle()
  @Get('health')
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @SkipThrottle()
  @Get()
  root() {
    return { name: 'Boi Pora API', version: '1.0.0', status: 'running' };
  }
}
