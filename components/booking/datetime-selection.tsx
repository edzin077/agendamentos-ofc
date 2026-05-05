"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { generateTimeSlots, TimeSlot } from "@/lib/booking-types"
import { getBookedTimeSlots } from "@/lib/supabase"

interface DateTimeSelectionProps {
  selectedDate: Date | null
  selectedTime: string | null
  professionalId: string | null
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
}

export function DateTimeSelection({ 
  selectedDate, 
  selectedTime, 
  professionalId,
  onSelectDate, 
  onSelectTime 
}: DateTimeSelectionProps) {
  const [dates, setDates] = useState<Date[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate next 14 days
    const generatedDates: Date[] = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      generatedDates.push(date)
    }
    setDates(generatedDates)
    setTimeSlots(generateTimeSlots())
  }, [])

  useEffect(() => {
    async function loadAvailableSlots() {
      if (!selectedDate || !professionalId) {
        setTimeSlots(generateTimeSlots())
        return
      }

      setIsLoadingSlots(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const bookedTimes = await getBookedTimeSlots(professionalId, dateStr)
        
        // Generate slots and mark booked ones as unavailable
        const allSlots = generateTimeSlots()
        const updatedSlots = allSlots.map(slot => ({
          ...slot,
          available: slot.available && !bookedTimes.includes(slot.time)
        }))
        
        setTimeSlots(updatedSlots)
      } catch (error) {
        console.error('Erro ao carregar horários:', error)
        setTimeSlots(generateTimeSlots())
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadAvailableSlots()
  }, [selectedDate, professionalId])

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  }

  const formatDayNumber = (date: Date) => {
    return date.getDate()
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
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
          Escolha Data e Horário
        </h2>
        <p className="text-muted-foreground text-sm">
          Selecione o melhor momento para você
        </p>
      </div>

      {/* Date Carousel */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 glass rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-10 py-2"
        >
          {dates.map((date, index) => (
            <motion.button
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[70px] h-[90px] glass rounded-2xl transition-all duration-300",
                "hover:border-primary/50 active:scale-95",
                selectedDate?.toDateString() === date.toDateString() 
                  ? "border-primary/70 bg-primary/10" 
                  : "",
                isToday(date) && "ring-1 ring-primary/30"
              )}
            >
              <span className="text-xs text-muted-foreground uppercase">
                {formatDayName(date)}
              </span>
              <span className="text-2xl font-bold text-foreground">
                {formatDayNumber(date)}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {formatMonth(date)}
              </span>
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 glass rounded-full flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-foreground text-center">
            Horários Disponíveis
          </h3>
          
          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot, index) => (
                <motion.button
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => slot.available && onSelectTime(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    "py-4 px-3 glass rounded-xl text-center transition-all duration-300 min-h-[56px]",
                    slot.available 
                      ? "hover:border-primary/50 active:scale-95" 
                      : "opacity-40 cursor-not-allowed line-through",
                    selectedTime === slot.time && slot.available 
                      ? "border-primary/70 bg-primary/10" 
                      : ""
                  )}
                >
                  <span className={cn(
                    "font-semibold",
                    selectedTime === slot.time ? "gold-gradient" : "text-foreground"
                  )}>
                    {slot.time}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
