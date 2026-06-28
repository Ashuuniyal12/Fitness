import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
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
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER')
  async createPlan(@Body() dto: CreateWorkoutPlanDto, @Req() req) {
    return this.workoutsService.createPlan(dto, req.user.id, req.user.gymId);
  }

  @Get('plans')
  async getPlans(@Query('goal') goal: GoalType, @Req() req) {
    return this.workoutsService.findAllPlans(goal, req.user.gymId);
  }

  @Post('sessions')
  async logSession(@Body() dto: LogWorkoutSessionDto, @Req() req) {
    return this.workoutsService.logSession(dto, req.user.id, req.user.gymId);
  }

  @Get('sessions')
  async getHistory(@Req() req) {
    return this.workoutsService.findHistory(req.user.id);
  }
}
