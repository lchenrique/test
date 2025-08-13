import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { evolutionApi } from '../../lib/evolution-api'
import {
  createInstanceSchema,
  createInstanceWrapperResponseSchema,
  errorResponseSchema,
} from '../../schemas'

export const createInstance: FastifyPluginAsyncZod = async (app) => {
  // Rota temporária sem validação para debug
  app.post('/debug', async (request, reply) => {
    try {
      console.log('🔍 Debug - Headers:', request.headers)
      console.log('🔍 Debug - Body:', request.body)
      
      const data = request.body as any
      const response = await evolutionApi.createInstance(data)

      return {
        data: response.data,
        message: 'Instância criada com sucesso (debug)',
      }
    } catch (error: any) {
      console.error('❌ Debug - Erro:', error.message)
      return reply.status(500).send({
        error: error.message,
        details: error.response?.data
      })
    }
  })

  app.post('/', {
    schema: {
      tags: ['instances'],
      description: 'Criar uma nova instância do WhatsApp',
      body: createInstanceSchema,
      response: {
        200: createInstanceWrapperResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
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

      const data = request.body

      console.log('📝 Dados recebidos:', JSON.stringify(data, null, 2))

      const response = await evolutionApi.createInstance(data)
      
      console.log('✅ Resposta da Evolution API:', JSON.stringify(response.data, null, 2))

      const result = {
        data: response.data,
        message: 'Instância criada com sucesso',
      }
      
      console.log('📤 Resposta que será enviada:', JSON.stringify(result, null, 2))

      return result
    } catch (error: any) {
      console.error('❌ Erro ao criar instância:', error.message)
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