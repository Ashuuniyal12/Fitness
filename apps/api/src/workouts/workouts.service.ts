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

  async updatePlan(id: string, dto: CreateWorkoutPlanDto, creatorId: string, gymId: string) {
    const plan = await this.prisma.workoutPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Workout plan not found');
    if (plan.creatorId !== creatorId) throw new NotFoundException('You do not have permission to edit this plan');

    return this.prisma.$transaction(async (tx) => {
      await tx.workoutExercise.deleteMany({ where: { workoutPlanId: id } });

      return tx.workoutPlan.update({
        where: { id },
        data: {
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
    });
  }

  async findAllPlans(goal?: GoalType, gymId?: string, creatorId?: string) {
    return this.prisma.workoutPlan.findMany({
      where: {
        gymId,
        goal: goal || undefined,
        OR: creatorId ? [
          { creatorId },
          { creator: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'TRAINER'] } } }
        ] : undefined
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

  async getMyPrs(memberId: string) {
    return this.prisma.pR.findMany({
      where: { memberId },
      include: {
        exercise: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async submitPr(memberId: string, gymId: string, dto: { exerciseId: string; weight: number; reps: number; bodyWeight?: number }) {
    const profile = await this.prisma.profile.findUnique({ where: { id: memberId } });
    const bw = dto.bodyWeight ?? profile?.weight ?? null;
    return this.prisma.pR.create({
      data: {
        memberId,
        gymId,
        exerciseId: dto.exerciseId,
        maxWeight: dto.weight,
        reps: dto.reps,
        bodyWeight: bw,
        status: 'PENDING',
      },
      include: {
        exercise: true,
      },
    });
  }

  async getPendingPrs(gymId: string) {
    return this.prisma.pR.findMany({
      where: { gymId, status: 'PENDING' },
      include: {
        exercise: true,
        member: {
          include: {
            profile: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyPr(prId: string, trainerId: string, approve: boolean) {
    const trainer = await this.prisma.trainer.findUnique({ where: { id: trainerId } });
    const approvedBy = trainer ? trainer.id : null;

    return this.prisma.pR.update({
      where: { id: prId },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        approvedBy,
      },
    });
  }

  async getLeaderboard(gymId: string, exerciseId: string) {
    const prs = await this.prisma.pR.findMany({
      where: {
        gymId,
        exerciseId,
        status: 'APPROVED',
      },
      include: {
        member: {
          include: {
            profile: {
              select: { name: true, photoUrl: true }
            }
          }
        }
      }
    });

    const categories = {
      'Lightweight': [] as any[],
      'Middleweight': [] as any[],
      'Heavyweight': [] as any[],
      'Super Heavyweight': [] as any[]
    };

    const memberBestPrs = new Map<string, typeof prs[0]>();
    for (const pr of prs) {
      const existing = memberBestPrs.get(pr.memberId);
      if (!existing || pr.maxWeight > existing.maxWeight || (pr.maxWeight === existing.maxWeight && pr.reps > existing.reps)) {
        memberBestPrs.set(pr.memberId, pr);
      }
    }

    for (const pr of memberBestPrs.values()) {
      const bw = pr.bodyWeight ?? 70;
      let cat: keyof typeof categories = 'Middleweight';
      if (bw <= 60) cat = 'Lightweight';
      else if (bw <= 75) cat = 'Middleweight';
      else if (bw <= 90) cat = 'Heavyweight';
      else cat = 'Super Heavyweight';

      categories[cat].push({
        id: pr.id,
        memberId: pr.memberId,
        memberName: pr.member.profile?.name || 'Gym Member',
        photoUrl: pr.member.profile?.photoUrl || null,
        weight: pr.maxWeight,
        reps: pr.reps,
        bodyWeight: pr.bodyWeight,
        date: pr.createdAt
      });
    }

    for (const cat of Object.keys(categories) as Array<keyof typeof categories>) {
      categories[cat].sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return b.reps - a.reps;
      });
    }

    return categories;
  }
}
