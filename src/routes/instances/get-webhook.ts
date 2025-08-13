import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { evolutionApi } from '../../lib/evolution-api'
import { instanceParamsSchema, errorResponseSchema } from '../../schemas'

export const getWebhook: FastifyPluginAsyncZod = async (app) => {
  // Rota para verificar configuração atual do webhook
  app.get('/:instance/webhook', {
    schema: {
      tags: ['instances'],
      description: 'Verificar configuração atual do webhook',
      params: instanceParamsSchema,
      response: {
        200: z.object({
          data: z.unknown(),
          message: z.string(),
        }),
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

      console.log(`🔍 Verificando configuração do webhook para: ${instance}`)

      const response = await evolutionApi.getWebhook(instance)

      console.log('✅ Configuração do webhook:', JSON.stringify(response.data, null, 2))

      return {
        data: response.data,
        message: 'Configuração do webhook obtida com sucesso',
      }
    } catch (error: any) {
      console.error('❌ Erro ao obter configuração do webhook:', error.message)
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