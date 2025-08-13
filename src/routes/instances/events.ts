import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { evolutionApi } from '../../lib/evolution-api'

// Store para manter as conexões SSE ativas
const sseConnections = new Map<string, Set<any>>()

// Função para enviar evento para todas as conexões de uma instância
export function broadcastToInstance(instanceName: string, event: any) {
  const connections = sseConnections.get(instanceName)
  console.log(`📡 Tentando broadcast para instância: ${instanceName}`)
  console.log(`📊 Conexões ativas: ${connections ? connections.size : 0}`)
  console.log(`📋 Evento:`, JSON.stringify(event, null, 2))
  
  if (connections) {
    const eventData = `data: ${JSON.stringify(event)}\n\n`
    let successCount = 0
    let errorCount = 0
    
    connections.forEach(reply => {
      try {
        reply.raw.write(eventData)
        successCount++
      } catch (error) {
        console.error('❌ Erro ao enviar SSE:', error)
        connections.delete(reply)
        errorCount++
      }
    })
    
    console.log(`✅ Eventos enviados: ${successCount} sucesso, ${errorCount} erro(s)`)
  } else {
    console.log(`⚠️ Nenhuma conexão SSE ativa para instância: ${instanceName}`)
  }
}

export async function instanceEventsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:instance/events',
    schema: {
      tags: ['instances'],
      summary: 'Stream de eventos em tempo real da instância',
      description: 'Conecta via Server-Sent Events para receber atualizações em tempo real',
      params: z.object({
        instance: z.string().min(1, 'Nome da instância é obrigatório'),
      }),

      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { instance } = request.params
      
      console.log(`📡 Nova conexão SSE para instância: ${instance}`)

      // Configurar headers SSE
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      })

      // Adicionar conexão ao store
      if (!sseConnections.has(instance)) {
        sseConnections.set(instance, new Set())
      }
      sseConnections.get(instance)!.add(reply)

      // Enviar evento inicial de conexão
      const initialEvent = {
        type: 'connection.established',
        timestamp: new Date().toISOString(),
        instance,
        data: { message: 'Conexão SSE estabelecida' }
      }
      reply.raw.write(`data: ${JSON.stringify(initialEvent)}\n\n`)

      // Verificar status inicial da instância
      try {
        const connectionState = await evolutionApi.getConnectionState(instance)
        const statusEvent = {
          type: 'connection.status',
          timestamp: new Date().toISOString(),
          instance,
          data: connectionState.data
        }
        reply.raw.write(`data: ${JSON.stringify(statusEvent)}\n\n`)
      } catch (error) {
        const errorEvent = {
          type: 'connection.error',
          timestamp: new Date().toISOString(),
          instance,
          data: { error: 'Instância não encontrada ou desconectada' }
        }
        reply.raw.write(`data: ${JSON.stringify(errorEvent)}\n\n`)
      }

      // Cleanup quando a conexão for fechada
      request.raw.on('close', () => {
        console.log(`📡 Conexão SSE fechada para instância: ${instance}`)
        const connections = sseConnections.get(instance)
        if (connections) {
          connections.delete(reply)
          if (connections.size === 0) {
            sseConnections.delete(instance)
          }
        }
      })

      // Manter a conexão viva
      const keepAlive = setInterval(() => {
        try {
          reply.raw.write(': heartbeat\n\n')
        } catch (error) {
          clearInterval(keepAlive)
        }
      }, 30000) // 30 segundos

      request.raw.on('close', () => {
        clearInterval(keepAlive)
      })
    },
  })
}