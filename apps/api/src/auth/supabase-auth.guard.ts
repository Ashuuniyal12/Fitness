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

    // Auto-create local user profile if it doesn't exist yet but exists in Supabase
    if (!dbUser) {
      dbUser = await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          role: 'MEMBER',
          profile: {
            create: {
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Member',
            },
          },
        },
        include: { profile: true },
      });
    }

    // Attach user information to request object
    request.user = dbUser;
    return true;
  }
}
