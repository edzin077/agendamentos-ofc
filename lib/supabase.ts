import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Número do WhatsApp da Maria Nail Design (dono)
const OWNER_WHATSAPP_NUMBER = '5577999148481'

// Função para formatar número de telefone para WhatsApp
function formatPhoneForWhatsApp(phone: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '')
  // Adiciona 55 (Brasil) se não tiver
  if (!numbers.startsWith('55')) {
    return '55' + numbers
  }
  return numbers
}

// Função para enviar mensagem via WhatsApp para o DONO
export function sendWhatsAppToOwner(message: string) {
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodedMessage}`
  
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank')
  }
  
  return whatsappUrl
}

// Função para enviar mensagem via WhatsApp para o CLIENTE
export function sendWhatsAppToClient(clientPhone: string, message: string) {
  const formattedPhone = formatPhoneForWhatsApp(clientPhone)
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  
  if (typeof window !== 'undefined') {
    // Abre em uma nova aba após um pequeno delay para permitir a primeira mensagem
    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
    }, 1000)
  }
  
  return whatsappUrl
}

// Função para enviar notificações de agendamento (dono e cliente)
export function sendBookingNotifications(booking: {
  customer_name: string
  customer_phone: string
  service_name: string
  service_price: number
  professional_name: string
  unit_name: string
  date: string
  time: string
}) {
  // Mensagem para o dono
  const ownerMessage = generateBookingMessageForOwner(booking)
  sendWhatsAppToOwner(ownerMessage)
  
  // Mensagem para o cliente
  const clientMessage = generateBookingMessageForClient(booking)
  sendWhatsAppToClient(booking.customer_phone, clientMessage)
}

// Função para enviar notificações de cancelamento (dono e cliente)
export function sendCancellationNotifications(booking: {
  customer_name: string
  customer_phone: string
  service_name: string
  professional_name: string
  unit_name: string
  date: string
  time: string
}) {
  // Mensagem para o dono
  const ownerMessage = generateCancellationMessageForOwner(booking)
  sendWhatsAppToOwner(ownerMessage)
  
  // Mensagem para o cliente
  const clientMessage = generateCancellationMessageForClient(booking)
  sendWhatsAppToClient(booking.customer_phone, clientMessage)
}

// Formatar data para exibição
function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long',
    year: 'numeric'
  })
}

// Formatar preço
function formatPriceBR(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

// Gerar mensagem de novo agendamento PARA O DONO
export function generateBookingMessageForOwner(booking: {
  customer_name: string
  customer_phone: string
  service_name: string
  service_price: number
  professional_name: string
  unit_name: string
  date: string
  time: string
}): string {
  return `*Novo Agendamento - Maria Nail Design*

*Cliente:* ${booking.customer_name}
*Telefone:* ${booking.customer_phone}

*Serviço:* ${booking.service_name}
*Valor:* ${formatPriceBR(booking.service_price)}

*Profissional:* ${booking.professional_name}
*Unidade:* ${booking.unit_name}

*Data:* ${formatDateBR(booking.date)}
*Horário:* ${booking.time}

---
_Mensagem automática do sistema de agendamento_`
}

// Gerar mensagem de novo agendamento PARA O CLIENTE
export function generateBookingMessageForClient(booking: {
  customer_name: string
  service_name: string
  service_price: number
  professional_name: string
  unit_name: string
  date: string
  time: string
}): string {
  return `*Agendamento Confirmado - Maria Nail Design*

Olá, *${booking.customer_name}*! Seu agendamento foi confirmado.

*Serviço:* ${booking.service_name}
*Valor:* ${formatPriceBR(booking.service_price)}

*Profissional:* ${booking.professional_name}
*Unidade:* ${booking.unit_name}

*Data:* ${formatDateBR(booking.date)}
*Horário:* ${booking.time}

Aguardamos você!

---
_Maria Nail Design_`
}

// Gerar mensagem de cancelamento PARA O DONO
export function generateCancellationMessageForOwner(booking: {
  customer_name: string
  customer_phone: string
  service_name: string
  professional_name: string
  unit_name: string
  date: string
  time: string
}): string {
  return `*Agendamento Cancelado - Maria Nail Design*

*Cliente:* ${booking.customer_name}
*Telefone:* ${booking.customer_phone}

*Serviço:* ${booking.service_name}
*Profissional:* ${booking.professional_name}
*Unidade:* ${booking.unit_name}

*Data:* ${formatDateBR(booking.date)}
*Horário:* ${booking.time}

_O horário foi liberado para novos agendamentos._

---
_Mensagem automática do sistema de agendamento_`
}

// Gerar mensagem de cancelamento PARA O CLIENTE
export function generateCancellationMessageForClient(booking: {
  customer_name: string
  service_name: string
  professional_name: string
  unit_name: string
  date: string
  time: string
}): string {
  return `*Agendamento Cancelado - Maria Nail Design*

Olá, *${booking.customer_name}*! Seu agendamento foi cancelado com sucesso.

*Serviço:* ${booking.service_name}
*Profissional:* ${booking.professional_name}
*Unidade:* ${booking.unit_name}

*Data:* ${formatDateBR(booking.date)}
*Horário:* ${booking.time}

Esperamos vê-lo em breve!

---
_Maria Nail Design_`
}

// Criar cliente apenas se as variáveis estiverem configuradas
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Types for database tables
export interface BookingRecord {
  id?: string
  unit_id: string
  unit_name: string
  professional_id: string
  professional_name: string
  service_id: string
  service_name: string
  service_price: number
  service_duration: number
  date: string
  time: string
  customer_name: string
  customer_phone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at?: string
  updated_at?: string
}

// Helper functions for bookings
export async function createBooking(booking: Omit<BookingRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function getBookingsByDate(date: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: true })

  if (error) throw error
  return data
}

export async function getBookingsByProfessional(professionalId: string, date: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .order('time', { ascending: true })

  if (error) throw error
  return data
}

export async function updateBookingStatus(id: string, status: BookingRecord['status']) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Check if a specific time slot is available for a professional on a given date
export async function checkTimeSlotAvailability(
  professionalId: string, 
  date: string, 
  time: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .eq('time', time)
    .neq('status', 'cancelled')
    .limit(1)

  if (error) throw error
  return !data || data.length === 0
}

// Get all booked time slots for a professional on a given date
export async function getBookedTimeSlots(
  professionalId: string, 
  date: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('time')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .neq('status', 'cancelled')

  if (error) throw error
  return data?.map(booking => booking.time) || []
}

// Cancel a booking by ID
export async function cancelBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) throw error
  return true
}

// Get a booking by ID
export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as BookingRecord
}

// Search booking by customer phone and date (for cancellation lookup)
export async function findBookingByPhoneAndDate(
  customerPhone: string,
  date: string
): Promise<BookingRecord[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_phone', customerPhone)
    .eq('date', date)
    .neq('status', 'cancelled')
    .order('time', { ascending: true })

  if (error) throw error
  return data as BookingRecord[]
}

// Get all bookings by customer phone
export async function getBookingsByPhone(customerPhone: string): Promise<BookingRecord[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_phone', customerPhone)
    .neq('status', 'cancelled')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) throw error
  return data as BookingRecord[]
}
