import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWorkoutPlanDto, LogWorkoutSessionDto } from '@maximus/types';
import { GoalType } from '@maximus/database';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async createPlan(dto: CreateWorkoutPlanDto, creatorId: string, gymId: string) {
    return this.prisma.workoutPlan.create({
      data: {
        gymId,
        creatorId,
        name: dto.name,
        description: dto.description,
        goal: dto.goal,
        workoutExercises: {
          create: dto.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
          })),
        },
      },
      include: {
        workoutExercises: {
          include: { exercise: true },
        },
      },
    });
  }

  async findAllPlans(goal?: GoalType, gymId?: string) {
    return this.prisma.workoutPlan.findMany({
      where: {
        gymId,
        goal: goal || undefined,
      },
      include: {
        workoutExercises: {
          include: { exercise: true },
        },
      },
    });
  }

  async logSession(dto: LogWorkoutSessionDto, memberId: string, gymId: string) {
    return this.prisma.workoutSession.create({
      data: {
        gymId,
        memberId,
        workoutPlanId: dto.workoutPlanId,
        notes: dto.notes,
        exercises: {
          create: dto.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            restSeconds: e.restSeconds,
            notes: e.notes,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });
  }

  async findHistory(memberId: string) {
    return this.prisma.workoutSession.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
      include: {
        workoutPlan: true,
        exercises: true,
      },
    });
  }
}
