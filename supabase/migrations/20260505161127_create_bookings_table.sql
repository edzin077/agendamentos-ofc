
/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key, auto-generated)
      - `unit_id` (text) - ID da unidade (cristais, tres-outeiros, macaubas)
      - `unit_name` (text) - Nome da unidade para exibição
      - `professional_id` (text) - ID do profissional
      - `professional_name` (text) - Nome do profissional
      - `service_id` (text) - ID do serviço
      - `service_name` (text) - Nome do serviço
      - `service_price` (decimal) - Preço do serviço
      - `service_duration` (integer) - Duração em minutos
      - `date` (date) - Data do agendamento
      - `time` (text) - Horário (HH:MM)
      - `customer_name` (text) - Nome do cliente
      - `customer_phone` (text) - Telefone do cliente
      - `status` (text) - Status: confirmed, pending, cancelled, completed
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

  2. Security
    - Enable RLS on `bookings` table
    - Public INSERT policy - anyone can book
    - Public SELECT policy - anyone can view bookings (needed for availability checks)
    - Public UPDATE policy - needed for cancellations
    - No DELETE policy - use status=cancelled instead

  3. Indexes
    - Index on professional_id + date for availability queries
    - Index on date for date-based queries
    - Index on customer_phone for lookup
    - Composite index for availability check

  4. Triggers
    - Conflict check: prevent double-booking same professional/date/time
    - Auto-update updated_at on changes
*/

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  service_duration INTEGER NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_professional_date
  ON public.bookings(professional_id, date);

CREATE INDEX IF NOT EXISTS idx_bookings_date
  ON public.bookings(date);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone
  ON public.bookings(customer_phone);

CREATE INDEX IF NOT EXISTS idx_bookings_availability
  ON public.bookings(professional_id, date, time, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Conflict check: no double booking
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE professional_id = NEW.professional_id
      AND date = NEW.date
      AND time = NEW.time
      AND status NOT IN ('cancelled')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Este horário já está reservado para este profissional';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_booking_conflict ON public.bookings;
CREATE TRIGGER trigger_check_booking_conflict
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_conflict();

-- RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update booking status"
  ON public.bookings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
