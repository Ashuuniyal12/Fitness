import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RegisterUserDto, UpdateProfileDto } from '@maximus/types';

@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll(@Req() req) {
    return this.usersService.findAll(req.user.gymId);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: RegisterUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get(':id/dashboard')
  async getDashboard(@Param('id') id: string) {
    return this.usersService.getDashboard(id);
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
