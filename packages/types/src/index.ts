import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'TRAINER',
  'RECEPTIONIST',
  'MEMBER',
  'GUEST'
]);

export const GoalTypeSchema = z.enum([
  'WEIGHT_LOSS',
  'MUSCLE_GAIN',
  'STRENGTH',
  'FITNESS'
]);

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: UserRoleSchema.default('MEMBER'),
  gymId: z.string().uuid().optional(),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalHistory: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  bmi: z.number().positive().optional(),
  goal: GoalTypeSchema.optional(),
  gender: z.string().optional(),
  dob: z.string().optional(), // ISO String
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const CreateWorkoutPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  goal: GoalTypeSchema,
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().positive(),
    reps: z.number().int().positive(),
    restSeconds: z.number().int().positive().default(60),
  })).min(1),
});

export type CreateWorkoutPlanDto = z.infer<typeof CreateWorkoutPlanSchema>;

export const LogWorkoutSessionSchema = z.object({
  workoutPlanId: z.string().uuid(),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().positive(),
    reps: z.number().int().positive(),
    weight: z.number().positive(),
    restSeconds: z.number().int().positive().default(60),
    notes: z.string().optional(),
  })).min(1),
});

export type LogWorkoutSessionDto = z.infer<typeof LogWorkoutSessionSchema>;

export const CreateDietPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  goal: GoalTypeSchema,
  meals: z.array(z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']),
    calories: z.number().int().positive(),
    protein: z.number().positive(),
    fat: z.number().positive(),
    carbs: z.number().positive(),
    instructions: z.string().optional(),
  })).min(1),
});

export type CreateDietPlanDto = z.infer<typeof CreateDietPlanSchema>;

export const CheckInAttendanceSchema = z.object({
  userId: z.string().uuid(),
});

export type CheckInAttendanceDto = z.infer<typeof CheckInAttendanceSchema>;

export const CreateLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(10),
  source: z.enum(['WEBSITE', 'WALK_IN', 'PHONE', 'FACEBOOK', 'INSTAGRAM']),
  status: z.enum(['INTERESTED', 'JOINED', 'REJECTED', 'FOLLOW_UP']).default('INTERESTED'),
  notes: z.string().optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;
