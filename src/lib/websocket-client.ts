import WebSocket from 'ws'
import { env } from '../config/env'

interface EvolutionWebSocketEvent {
  event: string
  instance: string
  data: any
  destination?: string
  date_time?: string
  sender?: string
  server_url?: string
  apikey?: string
}

class EvolutionWebSocketClient {
  private ws: WebSocket | null = null
  private reconnectInterval: NodeJS.Timeout | null = null
  private isConnecting = false

  constructor() {
    this.connect()
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    
    // URL do WebSocket da Evolution API
    const wsUrl = env.EVOLUTION_API_URL.replace('http', 'ws') + '/ws'
    
    console.log('🔌 Conectando ao WebSocket da Evolution API:', wsUrl)

    try {
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'apikey': env.EVOLUTION_API_KEY,
          'Authorization': `Bearer ${env.EVOLUTION_API_KEY}`,
        }
      })

      this.ws.on('open', () => {
        console.log('✅ WebSocket conectado à Evolution API!')
        this.isConnecting = false
        
        // Limpar intervalo de reconexão se existir
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval)
          this.reconnectInterval = null
        }
      })

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const event: EvolutionWebSocketEvent = JSON.parse(data.toString())
          this.handleEvent(event)
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error)
          console.log('📄 Dados recebidos:', data.toString())
        }
      })

      this.ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket desconectado. Código: ${code}, Razão: ${reason}`)
        this.isConnecting = false
        this.scheduleReconnect()
      })

      this.ws.on('error', (error) => {
        console.error('❌ Erro no WebSocket:', error.message)
        this.isConnecting = false
        this.scheduleReconnect()
      })

    } catch (error: any) {
      console.error('❌ Erro ao criar conexão WebSocket:', error.message)
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) {
      return // Já está agendado
    }

    console.log('🔄 Reagendando reconexão em 5 segundos...')
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null
      this.connect()
    }, 5000)
  }

  private handleEvent(event: EvolutionWebSocketEvent) {
    console.log(`\n🔔 Evento WebSocket recebido:`)
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`)
    console.log(`🏷️  Instância: ${event.instance}`)
    console.log(`🎯 Evento: ${event.event}`)
    
    // Processar diferentes tipos de eventos
    switch (event.event) {
      case 'messages.upsert':
        this.handleMessageEvent(event)
        break
      case 'connection.update':
        this.handleConnectionEvent(event)
        break
      case 'qrcode.updated':
        this.handleQRCodeEvent(event)
        break
      case 'messages.set':
        console.log('📥 Mensagens sincronizadas')
        break
      case 'contacts.set':
        console.log('👥 Contatos sincronizados')
        break
      case 'chats.set':
        console.log('💬 Chats sincronizados')
        break
      default:
        console.log(`📋 Evento: ${event.event}`)
        console.log(`📄 Dados:`, JSON.stringify(event.data, null, 2))
    }
    
    console.log('─'.repeat(80))
  }

  private handleMessageEvent(event: EvolutionWebSocketEvent) {
    const message = event.data
    const isFromMe = message.key?.fromMe || false
    const sender = isFromMe ? 'Você' : (message.pushName || message.key?.remoteJid || 'Desconhecido')
    
    console.log('💬 Nova mensagem:')
    console.log(`👤 De: ${sender}`)
    console.log(`📱 Para: ${message.key?.remoteJid || 'N/A'}`)
    
    if (message.message?.conversation) {
      console.log(`💭 Texto: ${message.message.conversation}`)
    } else if (message.message?.imageMessage) {
      console.log(`🖼️  Imagem: ${message.message.imageMessage.caption || 'Sem legenda'}`)
    } else if (message.message?.audioMessage) {
      console.log(`🎵 Áudio recebido`)
    } else {
      console.log(`📄 Tipo de mensagem:`, Object.keys(message.message || {}))
    }
  }

  private handleConnectionEvent(event: EvolutionWebSocketEvent) {
    const state = event.data?.state || 'unknown'
    const stateEmojis = {
      'close': '❌',
      'connecting': '🔄',
      'open': '✅'
    }
    
    const emoji = stateEmojis[state as keyof typeof stateEmojis] || '❓'
    console.log(`${emoji} Estado da conexão: ${state}`)
    
    if (event.data) {
      console.log(`📄 Detalhes:`, JSON.stringify(event.data, null, 2))
    }
  }

  private handleQRCodeEvent(event: EvolutionWebSocketEvent) {
    console.log('📱 QR Code atualizado!')
    if (event.data?.qrcode) {
      console.log('🔗 Novo QR Code disponível para escaneamento')
      // Aqui você poderia gerar o QR code no terminal se necessário
    }
  }

  public disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    console.log('🔌 WebSocket desconectado manualmente')
  }

  public getConnectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

// Instância singleton
export const evolutionWebSocket = new EvolutionWebSocketClient()