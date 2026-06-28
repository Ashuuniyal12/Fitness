import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterUserDto, UpdateProfileDto } from '@maximus/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId?: string) {
    return this.prisma.user.findMany({
      where: gymId ? { gymId } : {},
      include: { profile: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(dto: RegisterUserDto) {
    return this.prisma.user.create({
      data: {
        id: dto.gymId || undefined, // Set ID if available or let it map
        email: dto.email,
        role: dto.role,
        gymId: dto.gymId,
        profile: {
          create: {
            name: dto.name,
          },
        },
      },
      include: { profile: true },
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const profileData = {
      name: dto.name,
      phone: dto.phone,
      emergencyContact: dto.emergencyContact,
      medicalHistory: dto.medicalHistory,
      height: dto.height,
      weight: dto.weight,
      bmi: dto.bmi,
      goal: dto.goal,
      gender: dto.gender,
      dob: dto.dob ? new Date(dto.dob) : undefined,
    };

    return this.prisma.profile.update({
      where: { id },
      data: profileData,
    });
  }

  async getDashboard(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Retrieve active membership
    const membership = await this.prisma.membership.findFirst({
      where: { memberId: id, status: 'ACTIVE' },
      include: { plan: true },
    });

    // Retrieve recent workout session
    const workoutSession = await this.prisma.workoutSession.findFirst({
      where: { memberId: id },
      orderBy: { date: 'desc' },
      include: { workoutPlan: true },
    });

    // Retrieve recent logs
    const progressLogs = await this.prisma.measurement.findMany({
      where: { memberId: id },
      orderBy: { recordedAt: 'desc' },
      take: 7,
    });

    return {
      user,
      membership,
      recentWorkoutSession: workoutSession,
      measurements: progressLogs,
    };
  }
}
