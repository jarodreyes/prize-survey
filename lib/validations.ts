import { z } from 'zod'
import { LLM_OPTIONS, FRAMEWORK_OPTIONS, FUN_QUESTIONS } from './constants'

export const createSessionSchema = z.object({
  hostGithubId: z.string().optional(),
})

export const sessionStatusSchema = z.object({
  code: z.string().length(6),
})

export const submitResponseSchema = z.object({
  sessionCode: z.string().length(6),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  title: z.string().min(1, 'Job title is required').max(100),
  preferredLlm: z.enum(LLM_OPTIONS),
  preferredFramework: z.enum(FRAMEWORK_OPTIONS),
  location: z.string().min(1, 'Location is required').max(100),
  jobHunting: z.boolean(),
  funAnswers: z.record(
    z.enum(FUN_QUESTIONS.map(q => q.id) as [string, ...string[]]),
    z.string()
  ),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms to continue',
  }),
})

export const activityFeedSchema = z.object({
  sessionId: z.string().uuid(),
  limit: z.number().min(1).max(50).default(20),
})
