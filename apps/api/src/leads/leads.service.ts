import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeadDto } from '@maximus/types';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async submitLead(dto: CreateLeadDto, gymId: string) {
    return this.prisma.lead.create({
      data: {
        gymId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async findAll(gymId?: string) {
    return this.prisma.lead.findMany({
      where: gymId ? { gymId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}
