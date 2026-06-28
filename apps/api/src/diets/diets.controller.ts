import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { DietsService } from './diets.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDietPlanDto } from '@maximus/types';
import { GoalType } from '@maximus/database';

@Controller('diets')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DietsController {
  constructor(private readonly dietsService: DietsService) {}

  @Post('plans')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER')
  async createPlan(@Body() dto: CreateDietPlanDto, @Req() req) {
    return this.dietsService.createPlan(dto, req.user.id, req.user.gymId);
  }

  @Get('plans')
  async getPlans(@Query('goal') goal: GoalType, @Req() req) {
    return this.dietsService.findAllPlans(goal, req.user.gymId);
  }
}
