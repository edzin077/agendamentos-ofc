"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i + 1 === currentStep
              ? "w-8 gold-gradient-bg"
              : i + 1 < currentStep
              ? "w-2 bg-primary/60"
              : "w-2 bg-muted"
          )}
        />
      ))}
    </div>
  )
}
