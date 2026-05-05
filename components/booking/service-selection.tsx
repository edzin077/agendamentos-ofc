"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import Image from "next/image"
import { Service, SERVICES, Professional } from "@/lib/booking-types"
import { cn } from "@/lib/utils"

interface ServiceSelectionProps {
  selectedService: Service | null
  selectedProfessional: Professional | null
  onSelect: (service: Service) => void
}

export function ServiceSelection({ selectedService, selectedProfessional, onSelect }: ServiceSelectionProps) {
  // Filtra serviços que o profissional selecionado oferece
  const availableServices = SERVICES.filter(
    service => selectedProfessional && selectedProfessional.allowedServices.includes(service.id)
  )
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
    }
    return `${mins}min`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold gold-gradient mb-2">
          Escolha o Serviço
        </h2>
        <p className="text-muted-foreground text-sm">
          Selecione o serviço desejado
        </p>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto hide-scrollbar pb-4">
        {availableServices.map((service, index) => (
          <motion.button
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(service)}
            className={cn(
              "w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 min-h-[88px]",
              "hover:border-primary/50 active:scale-[0.98]",
              selectedService?.id === service.id && "border-primary/70 bg-primary/10"
            )}
          >
            <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden relative">
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground">{service.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDuration(service.duration)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold gold-gradient">
                {formatPrice(service.price)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
