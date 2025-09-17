'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FUN_QUESTIONS } from '@/lib/constants'

interface QuestionCardProps {
  onAnswersChange: (answers: Record<string, string>) => void
  initialAnswers?: Record<string, string>
}

export function QuestionCard({ onAnswersChange, initialAnswers = {} }: QuestionCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)
    onAnswersChange(newAnswers)
  }

  return (
    <div className="dev-card p-6">
      <h3 className="dev-heading text-xl mb-6">Fun Questions</h3>
      <p className="text-sm text-muted mb-6">
        Help us learn more about the developer community!
      </p>

      <div className="space-y-8">
        {FUN_QUESTIONS.map((question) => (
          <div key={question.id}>
            <h4 className="text-lg font-medium text-ink mb-4">
              {question.question}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option
                
                return (
                  <Button
                    key={option}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleAnswerSelect(question.id, option)}
                    className={`h-12 text-left justify-start transition-all ${
                      isSelected 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' 
                        : 'hover:border-accent/50'
                    }`}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-xs text-muted">
          Your answers help us understand developer preferences and will be shown in aggregate results.
        </p>
      </div>
    </div>
  )
}
