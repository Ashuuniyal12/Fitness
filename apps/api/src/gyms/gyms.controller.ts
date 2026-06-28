import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GymsService, CreateGymDto } from './gyms.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('gyms')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  /** GET /gyms — ADMIN and SUPER_ADMIN can list all gyms (for dropdowns) */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll() {
    return this.gymsService.findAll();
  }

  /** POST /gyms — SUPER_ADMIN creates a gym */
  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateGymDto) {
    return this.gymsService.create(dto);
  }

  /** PUT /gyms/:id — SUPER_ADMIN updates a gym */
  @Put(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateGymDto>) {
    return this.gymsService.update(id, dto);
  }
}
