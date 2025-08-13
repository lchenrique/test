import { aiClient } from '../lib/ai-client'
import { evolutionApi } from '../lib/evolution-api'

export class AIService {
  static async processMessage(instanceName: string, messageData: any): Promise<void> {
    try {
      console.log('🔍 [AI DEBUG] Iniciando processamento da mensagem...')
      console.log('🔍 [AI DEBUG] messageData.key:', JSON.stringify(messageData.key, null, 2))
      
      const isFromMe = messageData.key?.fromMe || false
      console.log(`🔍 [AI DEBUG] isFromMe: ${isFromMe}`)
      
      if (isFromMe) {
        console.log('🔍 [AI DEBUG] Mensagem é minha, ignorando...')
        return
      }

      const messageText = messageData.message?.conversation
      console.log(`🔍 [AI DEBUG] messageText: "${messageText}"`)
      
      if (!messageText) {
        console.log('🔍 [AI DEBUG] Não há texto na mensagem, ignorando...')
        return
      }
      
      const shouldRespond = aiClient.shouldRespond(messageText)
      console.log(`🔍 [AI DEBUG] shouldRespond: ${shouldRespond}`)
      
      if (!shouldRespond) {
        console.log('🔍 [AI DEBUG] IA decidiu não responder esta mensagem')
        return
      }

      const chatId = messageData.key.remoteJid
      const phoneNumber = chatId.replace('@s.whatsapp.net', '').replace('@g.us', '')
      console.log(`🔍 [AI DEBUG] chatId: ${chatId}`)
      console.log(`🔍 [AI DEBUG] phoneNumber: ${phoneNumber}`)

      console.log(`🤖 Gerando resposta IA para: "${messageText}"`)
      
      const aiResponse = await aiClient.generateResponse(messageText)
      console.log(`🔍 [AI DEBUG] Resposta gerada: "${aiResponse}"`)
      
      console.log(`🔍 [AI DEBUG] Enviando mensagem para instância: ${instanceName}`)
      await evolutionApi.sendTextMessage(instanceName, {
        number: phoneNumber,
        text: aiResponse
      })

      console.log(`✅ Resposta enviada: "${aiResponse}"`)
    } catch (error: any) {
      console.error('❌ Erro na IA:', error.message)
      console.error('❌ Stack trace:', error.stack)
    }
  }
}