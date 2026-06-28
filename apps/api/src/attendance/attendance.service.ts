import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private dayStart(d: Date) {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    return t;
  }

  // ── Member self check-in ────────────────────────────────────────────────────

  async checkIn(userId: string, gymId: string) {
    const today = this.dayStart(new Date());
    const existing = await this.prisma.attendance.findFirst({ where: { userId, date: today } });
    if (existing) throw new ConflictException('Already checked in today');
    return this.prisma.attendance.create({
      data: { gymId, userId, date: today, checkInTime: new Date() },
    });
  }

  // ── Admin mark attendance for any user on any date ──────────────────────────

  async markAttendance(userId: string, gymId: string, dateStr: string) {
    const date = this.dayStart(new Date(dateStr));
    const existing = await this.prisma.attendance.findFirst({ where: { userId, date } });
    if (existing) return existing; // idempotent
    return this.prisma.attendance.create({
      data: { gymId, userId, date, checkInTime: date },
    });
  }

  async unmarkAttendance(userId: string, dateStr: string) {
    const date = this.dayStart(new Date(dateStr));
    const existing = await this.prisma.attendance.findFirst({ where: { userId, date } });
    if (!existing) throw new NotFoundException('No attendance record found');
    return this.prisma.attendance.delete({ where: { id: existing.id } });
  }

  // ── Admin: all gym attendance for a month ──────────────────────────────────

  async getGymAttendance(gymId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return this.prisma.attendance.findMany({
      where: { gymId, date: { gte: start, lt: end } },
      include: { user: { include: { profile: { select: { name: true } } } } },
      orderBy: { date: 'asc' },
    });
  }

  // ── Member: own attendance for heatmap (last 12 months) ────────────────────

  async findHistory(userId: string) {
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
      select: { date: true, checkInTime: true, checkOutTime: true },
    });
  }
}
