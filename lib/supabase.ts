import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
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
