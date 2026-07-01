import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma.service';

export interface ProvisionUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  gymId?: string;
  height?: number;
  weight?: number;
}

@Injectable()
export class AuthService {
  private _supabaseAdmin: SupabaseClient | null = null;

  constructor(private prisma: PrismaService) {}

  private get supabaseAdmin(): SupabaseClient {
    if (!this._supabaseAdmin) {
      const url = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_KEY;
      if (!url || !serviceKey) {
        throw new BadRequestException(
          'SUPABASE_SERVICE_KEY is not configured. Contact the system administrator.',
        );
      }
      this._supabaseAdmin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    return this._supabaseAdmin;
  }

  /**
   * SUPER_ADMIN creates an ADMIN for a gym.
   */
  async createAdmin(dto: ProvisionUserDto) {
    return this.provisionUser({ ...dto, role: 'ADMIN' });
  }

  /**
   * ADMIN creates a MEMBER for their gym.
   */
  async createMember(dto: ProvisionUserDto, gymId?: string) {
    return this.provisionUser({ ...dto, role: 'MEMBER', gymId });
  }

  private async provisionUser(
    dto: ProvisionUserDto & { role: 'ADMIN' | 'MEMBER' },
  ) {
    // 1. Check if email already exists in our DB
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Create Supabase Auth user (admin SDK – bypasses email confirmation)
    const { data: authData, error: authError } =
      await this.supabaseAdmin.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
        user_metadata: {
          full_name: dto.name,
          phone: dto.phone || '',
          role: dto.role,
        },
      });

    if (authError) {
      throw new BadRequestException(authError.message);
    }

    const authUser = authData.user;

    // 3. Create User + Profile in our DB
    const user = await this.prisma.user.create({
      data: {
        id: authUser.id,
        email: dto.email,
        role: dto.role,
        gymId: dto.gymId || null,
        profile: {
          create: {
            name: dto.name,
            phone: dto.phone || null,
            height: dto.height || null,
            weight: dto.weight || null,
          },
        },
      },
      include: { profile: true },
    });

    return {
      message: `${dto.role} account created successfully`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gymId: user.gymId,
        name: user.profile?.name,
      },
    };
  }
}
