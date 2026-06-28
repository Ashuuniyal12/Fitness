import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://example.supabase.co',
      process.env.SUPABASE_ANON_KEY || 'anon-key'
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization Header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // Call Supabase API to fetch user profile with this token
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Fetch user role and gym from database
    let dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    // Reject users who exist in Supabase Auth but have not been provisioned
    // by an Admin. Only pre-created accounts (via admin or super-admin) are allowed.
    if (!dbUser) {
      throw new UnauthorizedException(
        'Account not provisioned. Please contact your gym administrator.',
      );
    }

    // Attach user information to request object
    request.user = dbUser;
    return true;
  }
}
