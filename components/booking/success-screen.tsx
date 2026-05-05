"use client"

import { motion } from "framer-motion"
import { Check, Calendar, MapPin, User, Clock, Sparkles } from "lucide-react"
import { BookingState } from "@/lib/booking-types"

interface SuccessScreenProps {
  booking: BookingState
  onNewBooking: () => void
}

export function SuccessScreen({ booking, onNewBooking }: SuccessScreenProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4"
    >
      {/* Animated Check Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2 
        }}
        className="relative mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-24 h-24 rounded-full gold-gradient-bg flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Check className="w-12 h-12 text-background" strokeWidth={3} />
          </motion.div>
        </motion.div>
        
        {/* Confetti rings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.5, 0], scale: 2 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute inset-0 rounded-full border-2 border-primary/30"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.3, 0], scale: 2.5 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-2xl font-bold gold-gradient text-center mb-2"
      >
        Agendamento Confirmado!
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-muted-foreground text-center mb-8"
      >
        Você receberá uma confirmação no WhatsApp
      </motion.p>

      {/* Booking Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm glass rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="text-foreground font-medium">{booking.customerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Unidade</p>
            <p className="text-foreground font-medium">{booking.unit?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Serviço</p>
            <p className="text-foreground font-medium">{booking.service?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="text-foreground font-medium capitalize">
              {booking.date ? formatDate(booking.date) : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Horário</p>
            <p className="text-foreground font-medium">{booking.time}</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-bold gold-gradient">
              {booking.service ? formatPrice(booking.service.price) : 'R$ 0,00'}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onNewBooking}
        className="mt-8 px-8 py-4 glass rounded-full text-foreground font-medium hover:border-primary/50 transition-all active:scale-95 min-h-[56px]"
      >
        Fazer Novo Agendamento
      </motion.button>
    </motion.div>
  )
}
