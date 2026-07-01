import { Controller, Get, Post, Patch, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateWorkoutPlanDto, LogWorkoutSessionDto } from '@maximus/types';
import { GoalType } from '@maximus/database';

@Controller('workouts')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('plans')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MEMBER')
  async createPlan(@Body() dto: CreateWorkoutPlanDto, @Req() req) {
    return this.workoutsService.createPlan(dto, req.user.id, req.user.gymId);
  }

  @Patch('plans/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MEMBER')
  async updatePlan(@Param('id') id: string, @Body() dto: CreateWorkoutPlanDto, @Req() req) {
    return this.workoutsService.updatePlan(id, dto, req.user.id, req.user.gymId);
  }

  @Get('plans')
  async getPlans(@Query('goal') goal: GoalType, @Req() req) {
    const creatorId = req.user.role === 'MEMBER' ? req.user.id : undefined;
    return this.workoutsService.findAllPlans(goal, req.user.gymId, creatorId);
  }

  @Post('sessions')
  async logSession(@Body() dto: LogWorkoutSessionDto, @Req() req) {
    return this.workoutsService.logSession(dto, req.user.id, req.user.gymId);
  }

  @Get('sessions')
  async getHistory(@Req() req) {
    return this.workoutsService.findHistory(req.user.id);
  }

  // ── PR & Leaderboard Endpoints ──────────────────────────────────────────────

  @Get('my-prs')
  async getMyPrs(@Req() req) {
    return this.workoutsService.getMyPrs(req.user.id);
  }

  @Post('pr')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MEMBER')
  async submitPr(@Body() dto: { exerciseId: string; weight: number; reps: number; bodyWeight?: number }, @Req() req) {
    return this.workoutsService.submitPr(req.user.id, req.user.gymId, dto);
  }

  @Get('prs/pending')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER')
  async getPendingPrs(@Req() req) {
    return this.workoutsService.getPendingPrs(req.user.gymId);
  }

  @Patch('prs/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER')
  async approvePr(@Param('id') id: string, @Req() req) {
    return this.workoutsService.verifyPr(id, req.user.id, true);
  }

  @Patch('prs/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER')
  async rejectPr(@Param('id') id: string, @Req() req) {
    return this.workoutsService.verifyPr(id, req.user.id, false);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('exerciseId') exerciseId: string, @Req() req) {
    return this.workoutsService.getLeaderboard(req.user.gymId, exerciseId);
  }
}
