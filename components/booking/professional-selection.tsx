"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { Professional, PROFESSIONALS, Unit } from "@/lib/booking-types"
import { cn } from "@/lib/utils"

interface ProfessionalSelectionProps {
  selectedProfessional: Professional | null
  selectedUnit: Unit | null
  onSelect: (professional: Professional) => void
}

export function ProfessionalSelection({ selectedProfessional, selectedUnit, onSelect }: ProfessionalSelectionProps) {
  // Filtra profissionais que trabalham na unidade selecionada
  const availableProfessionals = PROFESSIONALS.filter(
    professional => selectedUnit && professional.allowedUnits.includes(selectedUnit.id)
  )
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold gold-gradient mb-2">
          Escolha a Profissional
        </h2>
        <p className="text-muted-foreground text-sm">
          Nossas especialistas estão prontas para atendê-la
        </p>
      </div>

      <div className="grid gap-4">
        {availableProfessionals.map((professional, index) => (
          <motion.button
            key={professional.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(professional)}
            className={cn(
              "w-full glass rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 min-h-[88px]",
              "hover:border-primary/50 active:scale-[0.98]",
              selectedProfessional?.id === professional.id && "border-primary/70 bg-primary/10"
            )}
          >
            <div className="w-16 h-16 rounded-xl gold-gradient-bg shrink-0 overflow-hidden relative">
              <Image
                src={professional.avatar}
                alt={professional.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground text-xl">{professional.name}</h3>
              <p className="text-sm text-muted-foreground">{professional.specialty}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
