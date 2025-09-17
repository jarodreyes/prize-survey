'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LLM_OPTIONS, FRAMEWORK_OPTIONS } from '@/lib/constants'
import { QuestionCard } from './QuestionCard'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  title: z.string().min(1, 'Job title is required').max(100),
  preferredLlm: z.enum(LLM_OPTIONS),
  preferredFramework: z.enum(FRAMEWORK_OPTIONS),
  location: z.string().min(1, 'Location is required').max(100),
  jobHunting: z.boolean(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms to continue',
  }),
})

type FormData = z.infer<typeof formSchema>

interface LeadGenFormProps {
  sessionCode: string
  onSubmit: (data: FormData & { funAnswers: Record<string, string> }) => Promise<void>
  isSubmitting: boolean
}

export function LeadGenForm({ sessionCode, onSubmit, isSubmitting }: LeadGenFormProps) {
  const [funAnswers, setFunAnswers] = useState<Record<string, string>>({})
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      jobHunting: false,
      agreeToTerms: false,
    }
  })

  const watchedValues = watch()

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({ ...data, funAnswers })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Lead Generation Form */}
      <div className="dev-card p-6">
        <h2 className="dev-heading text-2xl mb-6">Tell us about yourself</h2>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. john@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Developer"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-danger">{errors.title.message}</p>
            )}
          </div>

          {/* Preferred LLM */}
          <div className="space-y-2">
            <Label htmlFor="preferredLlm">Preferred LLM *</Label>
            <Select onValueChange={(value) => setValue('preferredLlm', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred LLM" />
              </SelectTrigger>
              <SelectContent>
                {LLM_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredLlm && (
              <p className="text-sm text-danger">{errors.preferredLlm.message}</p>
            )}
          </div>

          {/* Preferred Framework */}
          <div className="space-y-2">
            <Label htmlFor="preferredFramework">Preferred JS Framework *</Label>
            <Select onValueChange={(value) => setValue('preferredFramework', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred framework" />
              </SelectTrigger>
              <SelectContent>
                {FRAMEWORK_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredFramework && (
              <p className="text-sm text-danger">{errors.preferredFramework.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA or Remote"
              {...register('location')}
            />
            {errors.location && (
              <p className="text-sm text-danger">{errors.location.message}</p>
            )}
          </div>


          {/* Job Hunting */}
          <div className="space-y-3">
            <Label>Are you currently job hunting?</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jobHuntingYes"
                  checked={watchedValues.jobHunting === true}
                  onCheckedChange={() => setValue('jobHunting', true)}
                />
                <Label htmlFor="jobHuntingYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jobHuntingNo"
                  checked={watchedValues.jobHunting === false}
                  onCheckedChange={() => setValue('jobHunting', false)}
                />
                <Label htmlFor="jobHuntingNo">No</Label>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={watchedValues.agreeToTerms}
                onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to allow SignalFire and DevAir to follow up once via email *
                </Label>
                <p className="text-xs text-muted">
                  This helps us improve our events and share relevant opportunities.
                </p>
              </div>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-danger">{errors.agreeToTerms.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={isSubmitting || Object.keys(funAnswers).length !== 3}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </form>
      </div>

      {/* Fun Questions */}
      <QuestionCard 
        onAnswersChange={setFunAnswers}
        initialAnswers={funAnswers}
      />

      {Object.keys(funAnswers).length < 3 && (
        <div className="dev-card p-4 border-warn/20 bg-warn/5">
          <p className="text-sm text-warn">
            Please answer all fun questions above to enable submission.
          </p>
        </div>
      )}
    </div>
  )
}
