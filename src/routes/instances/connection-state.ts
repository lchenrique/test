import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { evolutionApi } from '../../lib/evolution-api'
import {
  instanceParamsSchema,
  connectionStateWrapperResponseSchema,
  errorResponseSchema,
} from '../../schemas'

export const connectionState: FastifyPluginAsyncZod = async (app) => {
  app.get('/:instance/connectionState', {
    schema: {
      tags: ['instances'],
      description: 'Obter estado da conexão de uma instância',
      params: instanceParamsSchema,
      response: {
        200: connectionStateWrapperResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      // Validar API key
      const apiKey = request.headers.apikey as string
      if (!apiKey) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'API key é obrigatória',
        })
      }

      const { instance } = request.params

      console.log('🔍 Verificando estado da conexão para:', instance)

      const response = await evolutionApi.getConnectionState(instance)

      console.log('✅ Estado da conexão:', JSON.stringify(response.data, null, 2))

      const state = response.data.instance.state
      const stateMessages = {
        'close': '❌ Desconectado - Instância não está conectada ao WhatsApp',
        'connecting': '🔄 Conectando - Instância está tentando conectar',
        'open': '✅ Conectado - Instância está conectada e funcionando'
      }

      const message = stateMessages[state as keyof typeof stateMessages] || `Estado: ${state}`

      console.log(`📱 ${message}`)

      return {
        data: response.data,
        message,
      }
    } catch (error: any) {
      console.error('❌ Erro ao obter estado da conexão:', error.message)
      console.error('📊 Status:', error.response?.status)
      console.error('📄 Response data:', error.response?.data)

      const statusCode = error.response?.status || 500
      const message = error.response?.data?.message || 'Erro interno do servidor'

      return reply.status(statusCode).send({
        statusCode,
        error: error.response?.statusText || 'Internal Server Error',
        message,
      })
    }
  })
}