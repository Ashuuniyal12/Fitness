import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateLeadDto } from '@maximus/types';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async submitLead(@Body() dto: CreateLeadDto, @Req() req) {
    // Gym ID defaults or matches request user if authenticated, else is fallback
    const gymId = req?.user?.gymId || '00000000-0000-0000-0000-000000000000';
    return this.leadsService.submitLead(dto, gymId);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST')
  async getLeads(@Req() req) {
    return this.leadsService.findAll(req.user.gymId);
  }
}
