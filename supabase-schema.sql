-- =====================================================
-- SISTEMA DE AGENDAMENTO - SCHEMA DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Primeiro, limpe a tabela existente se houver (CUIDADO: isso apaga todos os dados!)
-- DROP TABLE IF EXISTS public.bookings;

-- =====================================================
-- TABELA: bookings (Agendamentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  -- Identificador único do agendamento
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações da Unidade
  unit_id TEXT NOT NULL,           -- ID da unidade (cristais, tres-outeiros, macaubas)
  unit_name TEXT NOT NULL,         -- Nome da unidade para exibição
  
  -- Informações do Profissional
  professional_id TEXT NOT NULL,   -- ID do profissional (maria, fabiana)
  professional_name TEXT NOT NULL, -- Nome do profissional para exibição
  
  -- Informações do Serviço
  service_id TEXT NOT NULL,        -- ID do serviço
  service_name TEXT NOT NULL,      -- Nome do serviço
  service_price DECIMAL(10,2) NOT NULL, -- Preço do serviço em reais
  service_duration INTEGER NOT NULL,    -- Duração em minutos
  
  -- Data e Hora do Agendamento
  date DATE NOT NULL,              -- Data do agendamento (YYYY-MM-DD)
  time TEXT NOT NULL,              -- Horário do agendamento (HH:MM)
  
  -- Informações do Cliente
  customer_name TEXT NOT NULL,     -- Nome do cliente
  customer_phone TEXT NOT NULL,    -- Telefone do cliente
  
  -- Status do Agendamento
  -- pending: aguardando confirmação
  -- confirmed: confirmado
  -- cancelled: cancelado
  -- completed: concluído
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES para otimizar consultas
-- =====================================================

-- Índice para buscar agendamentos por profissional e data (mais usado)
CREATE INDEX IF NOT EXISTS idx_bookings_professional_date 
ON public.bookings(professional_id, date);

-- Índice para buscar agendamentos por data
CREATE INDEX IF NOT EXISTS idx_bookings_date 
ON public.bookings(date);

-- Índice para buscar agendamentos por status
CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON public.bookings(status);

-- Índice para buscar agendamentos por unidade
CREATE INDEX IF NOT EXISTS idx_bookings_unit 
ON public.bookings(unit_id);

-- Índice composto para verificar disponibilidade de horário
CREATE INDEX IF NOT EXISTS idx_bookings_availability 
ON public.bookings(professional_id, date, time, status);

-- =====================================================
-- CONSTRAINT ÚNICA para evitar agendamentos duplicados
-- Um profissional não pode ter dois agendamentos no mesmo horário
-- (exceto se um deles estiver cancelado)
-- =====================================================

-- Função para verificar conflito de horários
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se já existe um agendamento ativo para o mesmo profissional, data e hora
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

-- Trigger para verificar conflitos antes de inserir ou atualizar
DROP TRIGGER IF EXISTS trigger_check_booking_conflict ON public.bookings;
CREATE TRIGGER trigger_check_booking_conflict
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_conflict();

-- =====================================================
-- FUNÇÃO para atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções (qualquer pessoa pode agendar)
DROP POLICY IF EXISTS "Permitir inserções públicas" ON public.bookings;
CREATE POLICY "Permitir inserções públicas" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir leituras (qualquer pessoa pode ver agendamentos)
DROP POLICY IF EXISTS "Permitir leituras públicas" ON public.bookings;
CREATE POLICY "Permitir leituras públicas" ON public.bookings
  FOR SELECT
  USING (true);

-- Política para permitir atualizações (qualquer pessoa pode atualizar)
DROP POLICY IF EXISTS "Permitir atualizações públicas" ON public.bookings;
CREATE POLICY "Permitir atualizações públicas" ON public.bookings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para permitir deleções (qualquer pessoa pode deletar)
DROP POLICY IF EXISTS "Permitir deleções públicas" ON public.bookings;
CREATE POLICY "Permitir deleções públicas" ON public.bookings
  FOR DELETE
  USING (true);

-- =====================================================
-- COMANDOS ÚTEIS
-- =====================================================

-- Ver todos os agendamentos
-- SELECT * FROM public.bookings ORDER BY date, time;

-- Ver agendamentos de um profissional em uma data específica
-- SELECT * FROM public.bookings 
-- WHERE professional_id = 'maria' AND date = '2026-05-05'
-- ORDER BY time;

-- Ver horários ocupados de um profissional em uma data
-- SELECT time FROM public.bookings 
-- WHERE professional_id = 'maria' 
--   AND date = '2026-05-05' 
--   AND status != 'cancelled';

-- Cancelar um agendamento
-- UPDATE public.bookings SET status = 'cancelled' WHERE id = 'UUID_DO_AGENDAMENTO';

-- Deletar todos os agendamentos (CUIDADO!)
-- DELETE FROM public.bookings;

-- =====================================================
-- LIMPAR AGENDAMENTOS DUPLICADOS (se necessário)
-- Execute APENAS se tiver agendamentos duplicados
-- =====================================================

-- Este comando remove agendamentos duplicados mantendo apenas o mais recente
-- DELETE FROM public.bookings a
-- USING public.bookings b
-- WHERE a.id < b.id
--   AND a.professional_id = b.professional_id
--   AND a.date = b.date
--   AND a.time = b.time
--   AND a.status != 'cancelled'
--   AND b.status != 'cancelled';
