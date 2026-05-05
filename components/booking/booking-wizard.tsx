"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { BookingState, Unit, Professional, Service } from "@/lib/booking-types"
import { createBooking } from "@/lib/supabase"
import { StepIndicator } from "./step-indicator"
import { UnitSelection } from "./unit-selection"
import { ProfessionalSelection } from "./professional-selection"
import { ServiceSelection } from "./service-selection"
import { DateTimeSelection } from "./datetime-selection"
import { CheckoutForm } from "./checkout-form"
import { SuccessScreen } from "./success-screen"

const TOTAL_STEPS = 5

const initialState: BookingState = {
  step: 1,
  unit: null,
  professional: null,
  service: null,
  date: null,
  time: null,
  customerName: "",
  customerPhone: "",
}

export function BookingWizard() {
  const [booking, setBooking] = useState<BookingState>(initialState)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (booking.step < TOTAL_STEPS) {
      updateBooking({ step: booking.step + 1 })
    }
  }

  const prevStep = () => {
    if (booking.step > 1) {
      updateBooking({ step: booking.step - 1 })
    }
  }

  const handleUnitSelect = (unit: Unit) => {
    updateBooking({ unit })
    setTimeout(nextStep, 300)
  }

  const handleProfessionalSelect = (professional: Professional) => {
    updateBooking({ professional })
    setTimeout(nextStep, 300)
  }

  const handleServiceSelect = (service: Service) => {
    updateBooking({ service })
    setTimeout(nextStep, 300)
  }

  const handleDateSelect = (date: Date) => {
    updateBooking({ date })
  }

  const handleTimeSelect = (time: string) => {
    updateBooking({ time })
    setTimeout(nextStep, 300)
  }

  const handleConfirm = async () => {
    if (booking.customerName && booking.customerPhone && booking.unit && booking.professional && booking.service && booking.date && booking.time) {
      setIsSubmitting(true)
      setError(null)
      
      try {
        await createBooking({
          unit_id: booking.unit.id,
          unit_name: booking.unit.name,
          professional_id: booking.professional.id,
          professional_name: booking.professional.name,
          service_id: booking.service.id,
          service_name: booking.service.name,
          service_price: booking.service.price,
          service_duration: booking.service.duration,
          date: booking.date.toISOString().split('T')[0],
          time: booking.time,
          customer_name: booking.customerName,
          customer_phone: booking.customerPhone,
          status: 'confirmed'
        })
        setIsComplete(true)
      } catch (err) {
        console.error('Erro ao criar agendamento:', err)
        setError('Erro ao criar agendamento. Tente novamente.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleNewBooking = () => {
    setBooking(initialState)
    setIsComplete(false)
  }

  const canProceed = () => {
    switch (booking.step) {
      case 5:
        return booking.customerName.trim() !== "" && booking.customerPhone.length >= 14
      default:
        return true
    }
  }

  if (isComplete) {
    return <SuccessScreen booking={booking} onNewBooking={handleNewBooking} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={prevStep}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              booking.step > 1
                ? "text-foreground hover:bg-secondary"
                : "text-transparent pointer-events-none"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold gold-gradient">Nail Design</h1>
            <p className="text-xs text-muted-foreground">Agende seu horário</p>
          </div>
          
          <div className="w-10" />
        </div>
        <StepIndicator currentStep={booking.step} totalSteps={TOTAL_STEPS} />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {booking.step === 1 && (
            <UnitSelection
              key="unit"
              selectedUnit={booking.unit}
              onSelect={handleUnitSelect}
            />
          )}
          
          {booking.step === 2 && (
            <ProfessionalSelection
              key="professional"
              selectedProfessional={booking.professional}
              onSelect={handleProfessionalSelect}
            />
          )}
          
          {booking.step === 3 && (
            <ServiceSelection
              key="service"
              selectedService={booking.service}
              onSelect={handleServiceSelect}
            />
          )}
          
          {booking.step === 4 && (
            <DateTimeSelection
              key="datetime"
              selectedDate={booking.date}
              selectedTime={booking.time}
              onSelectDate={handleDateSelect}
              onSelectTime={handleTimeSelect}
            />
          )}
          
          {booking.step === 5 && (
            <CheckoutForm
              key="checkout"
              booking={booking}
              onNameChange={(name) => updateBooking({ customerName: name })}
              onPhoneChange={(phone) => updateBooking({ customerPhone: phone })}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer - Confirm Button */}
      {booking.step === 5 && (
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 p-4 glass border-t border-border/30"
        >
          {error && (
            <p className="text-destructive text-sm text-center mb-2">{error}</p>
          )}
          <button
            onClick={handleConfirm}
            disabled={!canProceed() || isSubmitting}
            className={`w-full py-4 rounded-full font-semibold text-lg transition-all min-h-[56px] flex items-center justify-center gap-2 ${
              canProceed() && !isSubmitting
                ? "gold-gradient-bg text-background active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar Agendamento'
            )}
          </button>
        </motion.footer>
      )}
    </div>
  )
}
