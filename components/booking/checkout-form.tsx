"use client"

import { motion } from "framer-motion"
import { User, Phone, MapPin, Calendar, Clock, Sparkles } from "lucide-react"
import { BookingState } from "@/lib/booking-types"

interface CheckoutFormProps {
  booking: BookingState
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
}

export function CheckoutForm({ booking, onNameChange, onPhoneChange }: CheckoutFormProps) {
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    onPhoneChange(formatted)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold gold-gradient mb-2">
          Finalizar Agendamento
        </h2>
        <p className="text-muted-foreground text-sm">
          Preencha seus dados para confirmar
        </p>
      </div>

      {/* Booking Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 space-y-4"
      >
        <h3 className="font-semibold text-foreground mb-3">Resumo do Agendamento</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">{booking.unit?.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">{booking.professional?.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">{booking.service?.name}</span>
          </div>
          
          {booking.date && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground capitalize">{formatDate(booking.date)}</span>
            </div>
          )}
          
          {booking.time && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">{booking.time}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold gold-gradient">
              {booking.service ? formatPrice(booking.service.price) : 'R$ 0,00'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Customer Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={booking.customerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full glass rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-all text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              value={booking.customerPhone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="w-full glass rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-all text-base"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
