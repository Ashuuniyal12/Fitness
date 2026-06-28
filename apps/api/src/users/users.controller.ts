import { Controller, Get, Put, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateProfileDto } from '@maximus/types';

@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll(@Req() req) {
    return this.usersService.findAll(req.user.gymId);
  }

  @Get(':id/dashboard')
  async getDashboard(@Param('id') id: string) {
    return this.usersService.getDashboard(id);
  }

  @Patch(':id/gym')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateGym(
    @Param('id') id: string,
    @Body('gymId') gymId: string | null,
  ) {
    return this.usersService.updateGym(id, gymId ?? null);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED',
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
