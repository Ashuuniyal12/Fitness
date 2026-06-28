import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ExerciseDto {
  name: string;
  category: string;
  subcategory: string;
  difficulty: string;
  instructions?: string;
  mediaUrl?: string;
}

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.exercise.findMany({ orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }] });
  }

  create(dto: ExerciseDto) {
    return this.prisma.exercise.create({
      data: {
        name: dto.name,
        muscleGroup: `${dto.category}|${dto.subcategory}`,
        difficulty: dto.difficulty,
        instructions: dto.instructions ?? null,
        mediaUrl: dto.mediaUrl ?? null,
      },
    });
  }

  async update(id: string, dto: Partial<ExerciseDto>) {
    const ex = await this.prisma.exercise.findUnique({ where: { id } });
    if (!ex) throw new NotFoundException('Exercise not found');

    const [existingCat, existingSub] = ex.muscleGroup.includes('|')
      ? ex.muscleGroup.split('|')
      : [ex.muscleGroup, ''];

    const category    = dto.category    ?? existingCat;
    const subcategory = dto.subcategory ?? existingSub;

    return this.prisma.exercise.update({
      where: { id },
      data: {
        name: dto.name ?? ex.name,
        muscleGroup: `${category}|${subcategory}`,
        difficulty: dto.difficulty ?? ex.difficulty,
        instructions: dto.instructions !== undefined ? dto.instructions : ex.instructions,
        mediaUrl: dto.mediaUrl !== undefined ? dto.mediaUrl : ex.mediaUrl,
      },
    });
  }

  async remove(id: string) {
    const ex = await this.prisma.exercise.findUnique({ where: { id } });
    if (!ex) throw new NotFoundException('Exercise not found');
    return this.prisma.exercise.delete({ where: { id } });
  }
}
