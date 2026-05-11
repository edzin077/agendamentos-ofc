"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Calendar, Clock, User, Scissors, Phone, X, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { getBookingsByPhone, cancelBooking, BookingRecord, sendCancellationNotifications, generateCancellationMessageForOwner } from "@/lib/supabase"
import Link from "next/link"

export default function CancelarPage() {
  const [phone, setPhone] = useState("")
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    setError(null)
    setSuccessMessage(null)
  }

  const handleSearch = async () => {
    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length < 10) {
      setError("Por favor, insira um número de telefone válido")
      return
    }

    setIsSearching(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const results = await getBookingsByPhone(phone)
      setBookings(results)
      setHasSearched(true)
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err)
      setError("Erro ao buscar agendamentos. Tente novamente.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleCancel = async (booking: BookingRecord) => {
    if (!booking.id) return

    setCancellingId(booking.id)
    setError(null)

    try {
      await cancelBooking(booking.id)
      
      // Dados para notificações
      const cancellationData = {
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        service_name: booking.service_name,
        professional_name: booking.professional_name,
        unit_name: booking.unit_name,
        date: booking.date,
        time: booking.time
      }
      
      // Enviar notificação no Telegram para o dono (silenciosamente)
      const telegramMessage = generateCancellationMessageForOwner(cancellationData)
      fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: telegramMessage })
      }).catch(err => console.error('Erro ao enviar Telegram:', err))
      
      // Enviar notificações via WhatsApp (dono e cliente)
      sendCancellationNotifications(cancellationData)
      
      setBookings(bookings.filter(b => b.id !== booking.id))
      setSuccessMessage(`Agendamento de ${formatDate(booking.date)} às ${booking.time} cancelado com sucesso!`)
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err)
      setError("Erro ao cancelar agendamento. Tente novamente.")
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long' 
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Meus Agendamentos</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Buscar seus agendamentos</h2>
            <p className="text-muted-foreground text-sm">
              Digite o número de telefone usado no agendamento
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="(00) 00000-0000"
                className="w-full pl-12 pr-4 py-4 glass rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || phone.replace(/\D/g, "").length < 10}
              className={`w-full py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                phone.replace(/\D/g, "").length >= 10 && !isSearching
                  ? "gold-gradient-bg text-background active:scale-[0.98]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar Agendamentos
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 glass rounded-xl border border-destructive/30 bg-destructive/10"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 glass rounded-xl border border-green-500/30 bg-green-500/10"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-500">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-foreground">
              {bookings.length > 0 
                ? `${bookings.length} agendamento${bookings.length > 1 ? 's' : ''} encontrado${bookings.length > 1 ? 's' : ''}`
                : 'Nenhum agendamento encontrado'
              }
            </h3>

            {bookings.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Não encontramos agendamentos futuros para este número
                </p>
                <Link 
                  href="/"
                  className="inline-block text-primary hover:underline"
                >
                  Fazer um novo agendamento
                </Link>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-xl p-4 space-y-4"
                  >
                    {/* Date and Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-background" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground capitalize">
                            {formatDate(booking.date)}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.time}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {booking.status === 'confirmed' ? 'Confirmado' : booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Scissors className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{booking.service_name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="gold-gradient font-semibold">{formatPrice(booking.service_price)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{booking.professional_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{booking.unit_name}</span>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <button
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking.id}
                      className="w-full py-3 rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Cancelar Agendamento
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Link back */}
        {!hasSearched && (
          <div className="text-center pt-4">
            <Link 
              href="/"
              className="text-primary hover:underline text-sm"
            >
              Voltar para agendamento
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
