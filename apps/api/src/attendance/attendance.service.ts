import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: string, gymId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if check-in already exists for today
    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (existing) {
      throw new ConflictException('Already checked in today');
    }

    return this.prisma.attendance.create({
      data: {
        gymId,
        userId,
        date: today,
        checkInTime: new Date(),
      },
    });
  }

  async findHistory(userId: string) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }
}
