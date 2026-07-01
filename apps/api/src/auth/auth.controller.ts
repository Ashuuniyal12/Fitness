import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, ProvisionUserDto } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  gymId?: string;
}

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  phone: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsUUID()
  @IsOptional()
  gymId?: string;
}

@Controller('auth')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * SUPER_ADMIN only: provision a new ADMIN account.
   * POST /auth/create-admin
   */
  @Post('create-admin')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto);
  }

  /**
   * ADMIN only: provision a new MEMBER account for their gym.
   * POST /auth/create-member
   */
  @Post('create-member')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createMember(@Body() dto: CreateMemberDto, @Req() req) {
    // SUPER_ADMIN can specify any gym; ADMIN always uses their own gymId
    const gymId =
      req.user.role === 'SUPER_ADMIN'
        ? (dto.gymId ?? req.user.gymId)
        : req.user.gymId;
    return this.authService.createMember(dto, gymId);
  }
}
