import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembershipsService, CreatePlanDto, AssignMembershipDto } from './memberships.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('memberships')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  /** GET /memberships/plans — list plans for this gym */
  @Get('plans')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findPlans(@Req() req) {
    const gymId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.gymId;
    return this.membershipsService.findPlans(gymId);
  }

  /** POST /memberships/plans — create a plan */
  @Post('plans')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createPlan(@Req() req, @Body() dto: Omit<CreatePlanDto, 'gymId'> & { gymId?: string }) {
    const gymId = req.user.role === 'SUPER_ADMIN' ? (dto.gymId ?? req.user.gymId) : req.user.gymId;
    return this.membershipsService.createPlan({ ...dto, gymId } as CreatePlanDto);
  }

  /** PUT /memberships/plans/:id — update a plan */
  @Put('plans/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  updatePlan(@Param('id') id: string, @Body() dto: Partial<Omit<CreatePlanDto, 'gymId'>>) {
    return this.membershipsService.updatePlan(id, dto);
  }

  /** GET /memberships — list all memberships for this gym */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll(@Req() req) {
    const gymId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.gymId;
    return this.membershipsService.findMemberships(gymId);
  }

  /** POST /memberships — assign a membership to a member */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  assignMembership(@Req() req, @Body() dto: Omit<AssignMembershipDto, 'gymId'> & { gymId?: string }) {
    const gymId = req.user.role === 'SUPER_ADMIN' ? (dto.gymId ?? req.user.gymId) : req.user.gymId;
    return this.membershipsService.assignMembership({ ...dto, gymId } as AssignMembershipDto);
  }

  /** PATCH /memberships/:id/status — update membership status */
  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED',
  ) {
    return this.membershipsService.updateMembershipStatus(id, status);
  }

  /** POST /memberships/:id/renew — renew an expired membership */
  @Post(':id/renew')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  renewMembership(@Param('id') id: string) {
    return this.membershipsService.renewMembership(id);
  }

  /** GET /memberships/my — member's own active membership + history */
  @Get('my')
  @Roles('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'TRAINER', 'RECEPTIONIST')
  getMyMembership(@Req() req) {
    return this.membershipsService.getMyMembership(req.user.id);
  }

  /** GET /memberships/my/invoices — member's own invoices */
  @Get('my/invoices')
  @Roles('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'TRAINER', 'RECEPTIONIST')
  getMyInvoices(@Req() req) {
    return this.membershipsService.getMyInvoices(req.user.id);
  }

  /** GET /memberships/revenue — revenue summary for admins */
  @Get('revenue')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getRevenue(@Req() req) {
    const gymId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.gymId;
    return this.membershipsService.getRevenueSummary(gymId);
  }
}
