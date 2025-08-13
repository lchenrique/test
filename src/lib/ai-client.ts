import OpenAI from 'openai'
import { env } from '../config/env'

// Cliente OpenAI configurado para usar OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.OPEN_ROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://localhost:3333', // URL do seu site para rankings
    'X-Title': 'Evolution API Wrapper', // Nome do seu site para rankings
  },
})

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class AIClient {
  private readonly model = 'moonshotai/kimi-k2:free'

  /**
   * Gera uma resposta usando IA para uma mensagem recebida
   */
  async generateResponse(userMessage: string, context?: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: context || 'Você é um assistente útil e amigável. Responda de forma clara e concisa em português brasileiro.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ]

      console.log(`🤖 Gerando resposta IA para: "${userMessage.substring(0, 50)}..."`)

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content

      if (!response) {
        throw new Error('Nenhuma resposta gerada pela IA')
      }

      console.log(`✅ Resposta IA gerada: "${response.substring(0, 50)}..."`)
      return response.trim()

    } catch (error: any) {
      console.error('❌ Erro ao gerar resposta IA:', error.message)
      
      // Resposta de fallback em caso de erro
      return 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente mais tarde.'
    }
  }

  /**
   * Verifica se uma mensagem deve ser respondida automaticamente
   */
  shouldRespond(message: string): boolean {
    console.log(`🔍 [SHOULD RESPOND] Analisando mensagem: "${message}"`)
    console.log(`🔍 [SHOULD RESPOND] Comprimento: ${message.length}`)
    
    // Não responder a mensagens muito curtas ou apenas emojis
    // if (message.length < 3) {
    //   console.log('🔍 [SHOULD RESPOND] Mensagem muito curta (< 3 chars), não respondendo')
    //   return false
    // }
    
    // Não responder a comandos (mensagens que começam com /)
    if (message.startsWith('/')) {
      console.log('🔍 [SHOULD RESPOND] Mensagem é um comando (/), não respondendo')
      return false
    }
    
    // Não responder a mensagens que são apenas números
    if (/^\d+$/.test(message.trim())) {
      console.log('🔍 [SHOULD RESPOND] Mensagem é apenas números, não respondendo')
      return false
    }
    
    console.log('🔍 [SHOULD RESPOND] Mensagem aprovada para resposta!')
    return true
  }

  /**
   * Extrai contexto relevante de uma conversa para melhorar as respostas
   */
  extractContext(messages: string[]): string {
    if (messages.length === 0) return ''
    
    // Pega as últimas 3 mensagens para contexto
    const recentMessages = messages.slice(-3).join('\n')
    
    return `Contexto da conversa recente:\n${recentMessages}\n\nResponda considerando este contexto.`
  }
}

// Instância singleton do cliente de IA
export const aiClient = new AIClient()