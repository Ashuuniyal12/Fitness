import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateGymDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.gym.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  create(dto: CreateGymDto) {
    return this.prisma.gym.create({
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
      },
    });
  }

  async findOne(id: string) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) throw new NotFoundException('Gym not found');
    return gym;
  }

  update(id: string, dto: Partial<CreateGymDto>) {
    return this.prisma.gym.update({ where: { id }, data: dto });
  }
}
