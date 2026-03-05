import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('analytics')
  getAnalytics(
    @Query('metric') metric?: string,
    @Query('range') range?: string,
  ) {
    return this.adminService.getAnalytics(metric ?? 'newUsers', range ?? '30d');
  }

  @Get('activity')
  getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(
      Math.min(parseInt(limit ?? '20', 10) || 20, 50),
    );
  }
}
