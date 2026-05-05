"use client"

import { motion } from "framer-motion"
import { MapPin, ChevronRight } from "lucide-react"
import { Unit, UNITS } from "@/lib/booking-types"
import { cn } from "@/lib/utils"

interface UnitSelectionProps {
  selectedUnit: Unit | null
  onSelect: (unit: Unit) => void
}

export function UnitSelection({ selectedUnit, onSelect }: UnitSelectionProps) {
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
          Escolha a Unidade
        </h2>
        <p className="text-muted-foreground text-sm">
          Selecione a unidade mais próxima de você
        </p>
      </div>

      <div className="space-y-3">
        {UNITS.map((unit, index) => (
          <motion.button
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(unit)}
            className={cn(
              "w-full glass rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 min-h-[72px]",
              "hover:border-primary/50 active:scale-[0.98]",
              selectedUnit?.id === unit.id && "border-primary/70 bg-primary/10"
            )}
          >
            <div className="w-12 h-12 rounded-xl gold-gradient-bg flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-background" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground text-lg">{unit.name}</h3>
              <p className="text-sm text-muted-foreground">{unit.address}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
