import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CheckInAttendanceDto } from '@maximus/types';

@Controller('attendance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('checkin')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
  async checkIn(@Body() dto: CheckInAttendanceDto, @Req() req) {
    return this.attendanceService.checkIn(dto.userId, req.user.gymId);
  }

  @Get('history')
  async getHistory(@Req() req) {
    return this.attendanceService.findHistory(req.user.id);
  }
}
