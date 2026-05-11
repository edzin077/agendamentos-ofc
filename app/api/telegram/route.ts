import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram não configurado: TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não definidos')
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram não configurado' 
      }, { status: 200 }) // Retorna 200 para não quebrar o fluxo
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('Erro ao enviar mensagem no Telegram:', data)
      return NextResponse.json({ 
        success: false, 
        error: data.description 
      }, { status: 200 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar mensagem no Telegram:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno' 
    }, { status: 200 })
  }
}
