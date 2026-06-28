import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreatePlanDto {
  gymId: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
}

export interface AssignMembershipDto {
  gymId: string;
  memberId: string;
  planId: string;
  startDate: string;
}

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private nextInvoiceNumber(): string {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  private async createMembershipInvoice(
    gymId: string,
    memberId: string,
    plan: { name: string; price: any },
  ) {
    const price = Number(plan.price);
    const tax = +(price * 0.18).toFixed(2);
    const total = +(price + tax).toFixed(2);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await this.prisma.invoice.create({
      data: {
        gymId,
        memberId,
        invoiceNumber: this.nextInvoiceNumber(),
        amount: price,
        taxAmount: tax,
        totalAmount: total,
        status: 'PAID',
        dueDate,
      },
    });

    await this.prisma.payment.create({
      data: {
        gymId,
        invoiceId: invoice.id,
        amount: total,
        paymentMethod: 'CASH',
        status: 'SUCCESS',
      },
    });

    return invoice;
  }

  // ── Plans ──────────────────────────────────────────────────────────────────

  findPlans(gymId?: string) {
    return this.prisma.membershipPlan.findMany({
      where: gymId ? { gymId } : {},
      orderBy: { name: 'asc' },
    });
  }

  createPlan(dto: CreatePlanDto) {
    return this.prisma.membershipPlan.create({
      data: {
        gymId: dto.gymId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        durationDays: dto.durationDays,
      },
    });
  }

  updatePlan(id: string, dto: Partial<Omit<CreatePlanDto, 'gymId'>>) {
    return this.prisma.membershipPlan.update({
      where: { id },
      data: dto,
    });
  }

  // ── Memberships (admin) ────────────────────────────────────────────────────

  findMemberships(gymId?: string) {
    return this.prisma.membership.findMany({
      where: gymId ? { gymId } : {},
      include: {
        plan: true,
        profile: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignMembership(dto: AssignMembershipDto) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Membership plan not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const membership = await this.prisma.membership.create({
      data: {
        gymId: dto.gymId,
        memberId: dto.memberId,
        planId: dto.planId,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
      include: { plan: true, profile: true },
    });

    const invoice = await this.createMembershipInvoice(dto.gymId, dto.memberId, plan);

    return { ...membership, invoice };
  }

  async renewMembership(id: string) {
    const existing = await this.prisma.membership.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!existing) throw new NotFoundException('Membership not found');

    // New period starts today (or from old end date if still in future)
    const now = new Date();
    const startDate = existing.endDate > now ? existing.endDate : now;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + existing.plan.durationDays);

    // Mark old membership expired
    await this.prisma.membership.update({
      where: { id },
      data: { status: 'EXPIRED' },
    });

    const membership = await this.prisma.membership.create({
      data: {
        gymId: existing.gymId,
        memberId: existing.memberId,
        planId: existing.planId,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
      include: { plan: true, profile: true },
    });

    const invoice = await this.createMembershipInvoice(
      existing.gymId,
      existing.memberId,
      existing.plan,
    );

    return { ...membership, invoice };
  }

  async updateMembershipStatus(
    id: string,
    status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED',
  ) {
    const membership = await this.prisma.membership.findUnique({ where: { id } });
    if (!membership) throw new NotFoundException('Membership not found');
    return this.prisma.membership.update({
      where: { id },
      data: {
        status,
        frozenAt: status === 'FROZEN' ? new Date() : undefined,
        unfrozenAt: status === 'ACTIVE' && membership.status === 'FROZEN' ? new Date() : undefined,
      },
    });
  }

  // ── Member-facing (own membership + invoices) ─────────────────────────────

  async getMyMembership(profileId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { memberId: profileId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    const active = memberships.find((m) => m.status === 'ACTIVE') ?? null;
    return {
      active,
      history: memberships,
    };
  }

  async getMyInvoices(profileId: string) {
    return this.prisma.invoice.findMany({
      where: { memberId: profileId },
      orderBy: { createdAt: 'desc' },
      include: { payments: true },
    });
  }

  // ── Revenue (admin) ────────────────────────────────────────────────────────

  async getRevenueSummary(gymId?: string) {
    const where = gymId ? { gymId } : {};

    const [invoices, totalPaid] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { ...where, status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        include: {
          profile: { select: { name: true } },
          payments: true,
        },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    // Monthly breakdown
    const byMonth: Record<string, number> = {};
    for (const inv of invoices) {
      const key = inv.createdAt.toISOString().slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] ?? 0) + Number(inv.totalAmount);
    }

    return {
      totalRevenue: Number(totalPaid._sum.totalAmount ?? 0),
      invoices,
      byMonth: Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
    };
  }
}
