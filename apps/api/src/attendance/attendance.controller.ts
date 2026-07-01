import { Controller, Get, Post, Delete, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('attendance')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** POST /attendance/checkin — member self check-in */
  @Post('checkin')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'MEMBER')
  async checkIn(@Body() dto: { userId?: string }, @Req() req) {
    const userId = dto.userId ?? req.user.id;
    return this.attendanceService.checkIn(userId, req.user.gymId);
  }

  /** POST /attendance/generate-code — generate daily attendance code */
  @Post('generate-code')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
  async generateCode(@Req() req) {
    return this.attendanceService.generateDailyCode(req.user.gymId);
  }

  /** GET /attendance/code — get current active daily code */
  @Get('code')
  async getCode(@Req() req) {
    return this.attendanceService.getDailyCode(req.user.gymId);
  }

  /** POST /attendance/checkin-code — check-in with daily code */
  @Post('checkin-code')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'MEMBER')
  async checkInWithCode(@Body() dto: { code: string }, @Req() req) {
    return this.attendanceService.checkInWithCode(req.user.id, req.user.gymId, dto.code);
  }

  /** POST /attendance/mark — admin marks attendance for a user on a date */
  @Post('mark')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
  async mark(@Body() dto: { userId: string; date: string }, @Req() req) {
    return this.attendanceService.markAttendance(dto.userId, req.user.gymId, dto.date);
  }

  /** DELETE /attendance/unmark — admin removes an attendance record */
  @Delete('unmark')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
  async unmark(@Body() dto: { userId: string; date: string }) {
    return this.attendanceService.unmarkAttendance(dto.userId, dto.date);
  }

  /** GET /attendance/gym?year=2026&month=6 — admin gets all gym attendance for a month */
  @Get('gym')
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
  async getGym(@Req() req, @Query('year') year: string, @Query('month') month: string) {
    const y = year ? +year : new Date().getFullYear();
    const m = month ? +month : new Date().getMonth() + 1;
    return this.attendanceService.getGymAttendance(req.user.gymId, y, m);
  }

  /** GET /attendance/history — member's own attendance (last 12 months) */
  @Get('history')
  async getHistory(@Req() req) {
    return this.attendanceService.findHistory(req.user.id);
  }
}
