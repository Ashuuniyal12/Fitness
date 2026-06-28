import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExercisesService, ExerciseDto } from './exercises.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('exercises')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ExercisesController {
  constructor(private readonly svc: ExercisesService) {}

  /** GET /exercises — anyone authenticated can browse */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TRAINER', 'MEMBER', 'RECEPTIONIST')
  findAll() { return this.svc.findAll(); }

  /** POST /exercises — admin creates */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: ExerciseDto) { return this.svc.create(dto); }

  /** PUT /exercises/:id — admin updates */
  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<ExerciseDto>) {
    return this.svc.update(id, dto);
  }

  /** DELETE /exercises/:id — admin deletes */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
