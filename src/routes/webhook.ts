import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AIService } from '../services/ai-service'
import { broadcastToInstance } from './instances/events'

// Schema para parâmetros da rota de webhook
const webhookParamsSchema = z.object({
    instanceName: z.string().min(1, 'Nome da instância é obrigatório'),
})

// Schema básico para eventos de webhook (pode ser expandido conforme necessário)
const webhookEventSchema = z.object({
    event: z.string(),
    instance: z.string(),
    data: z.unknown(),
    destination: z.string().optional(),
    date_time: z.string().optional(),
    sender: z.string().optional(),
    server_url: z.string().optional(),
    apikey: z.string().optional(),
})

export const webhookRoutes: FastifyPluginAsyncZod = async (app) => {
    // Rota POST para receber webhooks
    app.post('/webhook/:instanceName', {
        schema: {
            tags: ['webhook'],
            description: 'Receber eventos de webhook de uma instância específica',
            params: webhookParamsSchema,
            body: webhookEventSchema,
        },
    }, async (request, reply) => {
        try {
            console.log('\n🚨 WEBHOOK ENDPOINT CHAMADO!')
            console.log('📍 Método:', request.method)
            console.log('🔗 URL:', request.url)
            console.log('📡 IP:', request.ip)
            console.log('📋 Headers:', JSON.stringify(request.headers, null, 2))
            
            const { instanceName } = request.params
            const eventData = request.body

            console.log(`\n🔔 WEBHOOK RECEBIDO!`)
            console.log(`🏷️  Instância: ${instanceName}`)
            console.log(`📅 Data/Hora: ${new Date().toISOString()}`)
            console.log(`🎯 Evento: ${eventData.event}`)
            console.log(`📄 Dados completos:`)
            console.log(JSON.stringify(eventData, null, 2))
            console.log('─'.repeat(80))

            // Processar diferentes tipos de eventos
            switch (eventData.event) {
                case 'messages.upsert':
                    await handleMessageEvent(instanceName, eventData)
                    break
                case 'connection.update':
                    handleConnectionEvent(eventData)
                    break
                case 'qrcode.updated':
                    handleQRCodeEvent(eventData)
                    break
                case 'contacts.upsert':
                    handleContactEvent(eventData)
                    break
                case 'presence.update':
                    handlePresenceEvent(eventData)
                    break
                case 'chats.upsert':
                    handleChatEvent(eventData)
                    break
                case 'send.message':
                    handleSendMessageEvent(eventData)
                    break
                case 'groups.upsert':
                    handleGroupEvent(eventData)
                    break
                default:
                    console.log(`📋 Evento não processado: ${eventData.event}`)
                    console.log(`📄 Dados:`, JSON.stringify(eventData.data, null, 2))
            }

            return {
                success: true,
                message: `Webhook processado para instância ${instanceName}`,
                timestamp: new Date().toISOString(),
            }
        } catch (error: any) {
            console.error('❌ Erro ao processar webhook:', error.message)

            return reply.status(500).send({
                success: false,
                error: 'Erro interno do servidor',
                message: error.message,
            })
        }
    })

    // Rota GET para testar se o webhook está funcionando
    app.get('/webhook/:instanceName', {
        schema: {
            tags: ['webhook'],
            description: 'Testar endpoint de webhook',
            params: webhookParamsSchema,
        },
    }, async (request, reply) => {
        const { instanceName } = request.params

        console.log(`🧪 Teste de webhook para instância: ${instanceName}`)

        return {
            message: `Webhook endpoint ativo para instância: ${instanceName}`,
            url: `${request.protocol}://${request.hostname}/webhook/${instanceName}`,
            methods: ['GET', 'POST'],
            timestamp: new Date().toISOString(),
        }
    })
}

// Funções para processar diferentes tipos de eventos
async function handleMessageEvent(instanceName: string, eventData: any) {
    const messages = Array.isArray(eventData.data) ? eventData.data : [eventData.data]
    
    for (const message of messages) {
        const isFromMe = message.key?.fromMe || false
        const sender = isFromMe ? 'Você' : (message.pushName || message.key?.remoteJid?.split('@')[0] || 'Desconhecido')
        const chat = message.key?.remoteJid || 'N/A'
        
        console.log('💬 NOVA MENSAGEM:')
        console.log(`👤 De: ${sender}`)
        console.log(`📱 Chat: ${chat}`)
        console.log(`📅 Timestamp: ${new Date(message.messageTimestamp * 1000).toLocaleString()}`)
        
        let messageText = ''
        
        if (message.message?.conversation) {
            messageText = message.message.conversation
            console.log(`💭 Texto: "${messageText}"`)
        } else if (message.message?.imageMessage) {
            console.log(`🖼️  Imagem: ${message.message.imageMessage.caption || 'Sem legenda'}`)
        } else if (message.message?.audioMessage) {
            console.log(`🎵 Áudio: ${message.message.audioMessage.seconds || 0}s`)
        } else if (message.message?.videoMessage) {
            console.log(`🎥 Vídeo: ${message.message.videoMessage.caption || 'Sem legenda'}`)
        } else if (message.message?.documentMessage) {
            console.log(`📄 Documento: ${message.message.documentMessage.fileName || 'Sem nome'}`)
        } else if (message.message?.stickerMessage) {
            console.log(`🎭 Sticker`)
        } else {
            console.log(`❓ Tipo de mensagem:`, Object.keys(message.message || {}))
        }

        // Processar mensagem com IA
        await AIService.processMessage(instanceName, message)
    }
}

function handleConnectionEvent(eventData: any) {
    const state = eventData.data?.state || 'unknown'
    const stateEmojis = {
        'close': '❌ DESCONECTADO',
        'connecting': '🔄 CONECTANDO',
        'open': '✅ CONECTADO'
    }
    
    const status = stateEmojis[state as keyof typeof stateEmojis] || `❓ ${state.toUpperCase()}`
    console.log(`🔗 CONEXÃO: ${status}`)
    
    if (eventData.data?.connection) {
        console.log(`📡 Detalhes: ${eventData.data.connection}`)
    }

    // Broadcast via SSE
    const sseEvent = {
        type: 'connection.update',
        timestamp: new Date().toISOString(),
        instance: eventData.instance,
        data: {
            state,
            status,
            connection: eventData.data?.connection,
            ...eventData.data
        }
    }
    broadcastToInstance(eventData.instance, sseEvent)
}

function handleQRCodeEvent(eventData: any) {
    console.log('\n🔥 === QR CODE EVENT HANDLER ===')
    console.log('📱 QR CODE ATUALIZADO!')
    console.log('🏷️  Instância:', eventData.instance)
    console.log('📋 Event Data completo:', JSON.stringify(eventData, null, 2))
    
    if (eventData.data?.qrcode) {
        console.log('✅ QR Code encontrado nos dados')
        console.log('🔗 Novo QR Code disponível para escaneamento')
        console.log('📋 QR Code data:', JSON.stringify(eventData.data.qrcode, null, 2))
    } else {
        console.log('❌ QR Code NÃO encontrado nos dados!')
        console.log('📄 Estrutura de dados recebida:', Object.keys(eventData.data || {}))
    }

    // Broadcast via SSE - enviar no formato que o frontend espera
    const qrCodeData = eventData.data?.qrcode
    const sseEvent = {
        type: 'qrcode.updated',
        timestamp: new Date().toISOString(),
        instance: eventData.instance,
        data: {
            // Enviar tanto o objeto qrcode quanto os campos individuais para compatibilidade
            qrcode: qrCodeData,
            code: qrCodeData?.code,
            base64: qrCodeData?.base64,
            message: 'Novo QR Code disponível'
        }
    }
    
    console.log('📡 Preparando envio via SSE...')
    console.log('📋 SSE Event:', JSON.stringify(sseEvent, null, 2))
    console.log('🚀 Chamando broadcastToInstance...')
    broadcastToInstance(eventData.instance, sseEvent)
    console.log('✅ broadcastToInstance chamado!')
    console.log('🔥 === FIM QR CODE EVENT HANDLER ===')
}

function handleContactEvent(eventData: any) {
    const contacts = Array.isArray(eventData.data) ? eventData.data : [eventData.data]
    console.log(`👥 CONTATOS: ${contacts.length} contato(s) sincronizado(s)`)
    
    contacts.slice(0, 3).forEach((contact: any) => {
        console.log(`📞 ${contact.name || contact.verifiedName || contact.id}: ${contact.id}`)
    })
    
    if (contacts.length > 3) {
        console.log(`... e mais ${contacts.length - 3} contatos`)
    }
}

function handlePresenceEvent(eventData: any) {
    const presence = eventData.data?.presences || eventData.data
    Object.entries(presence || {}).forEach(([jid, status]: [string, any]) => {
        const contact = jid.split('@')[0]
        const lastSeen = status.lastSeen ? new Date(status.lastSeen * 1000).toLocaleString() : 'N/A'
        console.log(`👁️  PRESENÇA: ${contact} - ${status.lastKnownPresence || 'unknown'} (${lastSeen})`)
    })
}

function handleChatEvent(eventData: any) {
    const chats = Array.isArray(eventData.data) ? eventData.data : [eventData.data]
    console.log(`💬 CHATS: ${chats.length} chat(s) sincronizado(s)`)
    
    chats.slice(0, 3).forEach((chat: any) => {
        const name = chat.name || chat.id?.split('@')[0] || 'Sem nome'
        const unread = chat.unreadCount || 0
        console.log(`📱 ${name}: ${unread} não lidas`)
    })
}

function handleSendMessageEvent(eventData: any) {
    console.log('📤 MENSAGEM ENVIADA:')
    console.log(`📱 Para: ${eventData.destination}`)
    console.log(`📄 Dados:`, JSON.stringify(eventData.data, null, 2))
}

function handleGroupEvent(eventData: any) {
    const groups = Array.isArray(eventData.data) ? eventData.data : [eventData.data]
    console.log(`👥 GRUPOS: ${groups.length} grupo(s) sincronizado(s)`)
    
    groups.slice(0, 3).forEach((group: any) => {
        console.log(`🏷️  ${group.subject || group.id}: ${group.participants?.length || 0} participantes`)
    })
}