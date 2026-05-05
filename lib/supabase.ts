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
