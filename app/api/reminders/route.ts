import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const OWNER_WHATSAPP_NUMBER = '5577999148481'

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

// Função para enviar mensagem no Telegram
async function sendTelegramMessage(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram não configurado')
    return false
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })
    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('Erro ao enviar Telegram:', error)
    return false
  }
}

// Esta API é chamada por um cron job para enviar lembretes
// Configure um cron job para chamar esta rota a cada hora
export async function GET() {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentHour = now.getHours()

    // Buscar agendamentos de hoje e amanhã
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Buscar agendamentos confirmados
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .in('date', [today, tomorrowStr])
      .eq('status', 'confirmed')

    if (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
    }

    const reminders: string[] = []

    for (const booking of bookings || []) {
      const bookingDate = new Date(booking.date + 'T' + booking.time)
      const hoursUntil = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      // Lembrete 12 horas antes (entre 11 e 13 horas)
      if (hoursUntil >= 11 && hoursUntil <= 13) {
        const message = `*Lembrete de Agendamento - Maria Nail Design*

Olá *${booking.customer_name}*! 

Seu agendamento é *amanhã*!

*Serviço:* ${booking.service_name}
*Valor:* ${formatPriceBR(booking.service_price)}
*Profissional:* ${booking.professional_name}
*Data:* ${formatDateBR(booking.date)}
*Horário:* ${booking.time}

Esperamos você!`

        await sendTelegramMessage(`Lembrete enviado para ${booking.customer_name} (12h antes) - ${booking.date} às ${booking.time}`)
        reminders.push(`12h: ${booking.customer_name}`)
      }

      // Lembrete no dia (entre 6h e 8h da manhã para agendamentos do dia)
      if (booking.date === today && currentHour >= 6 && currentHour <= 8) {
        const message = `*Lembrete - Maria Nail Design*

Olá *${booking.customer_name}*!

Seu agendamento é *HOJE*!

*Serviço:* ${booking.service_name}
*Horário:* ${booking.time}
*Profissional:* ${booking.professional_name}

Te esperamos!`

        await sendTelegramMessage(`Lembrete do dia enviado para ${booking.customer_name} - Horário: ${booking.time}`)
        reminders.push(`Hoje: ${booking.customer_name}`)
      }
    }

    // Enviar resumo dos lembretes para o dono via Telegram
    if (reminders.length > 0) {
      const summaryMessage = `*Resumo de Lembretes Enviados*

${reminders.join('\n')}

_Total: ${reminders.length} lembrete(s)_`

      await sendTelegramMessage(summaryMessage)
    }

    return NextResponse.json({ 
      success: true, 
      reminders: reminders.length,
      details: reminders
    })
  } catch (error) {
    console.error('Erro no sistema de lembretes:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
