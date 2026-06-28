import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDietPlanDto } from '@maximus/types';
import { GoalType } from '@maximus/database';

@Injectable()
export class DietsService {
  constructor(private prisma: PrismaService) {}

  async createPlan(dto: CreateDietPlanDto, creatorId: string, gymId: string) {
    return this.prisma.dietPlan.create({
      data: {
        gymId,
        creatorId,
        name: dto.name,
        description: dto.description,
        goal: dto.goal,
        meals: {
          create: dto.meals.map((m) => ({
            mealType: m.mealType,
            calories: m.calories,
            protein: m.protein,
            fat: m.fat,
            carbs: m.carbs,
            instructions: m.instructions,
          })),
        },
      },
      include: {
        meals: true,
      },
    });
  }

  async findAllPlans(goal?: GoalType, gymId?: string) {
    return this.prisma.dietPlan.findMany({
      where: {
        gymId,
        goal: goal || undefined,
      },
      include: {
        meals: true,
      },
    });
  }
}
