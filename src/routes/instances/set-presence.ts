import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { evolutionApi } from '../../lib/evolution-api'
import {
  instanceParamsSchema,
  setPresenceSchema,
  successResponseSchema,
  errorResponseSchema,
} from '../../schemas'

export const setPresence: FastifyPluginAsyncZod = async (app) => {
  app.post('/:instance/presence', {
    schema: {
      tags: ['instances'],
      description: 'Definir presença de uma instância do WhatsApp',
      params: instanceParamsSchema,
      body: setPresenceSchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { instance } = request.params
      const data = request.body

      const response = await evolutionApi.setPresence(instance, data)

      return {
        data: response.data,
        message: 'Presença definida com sucesso',
      }
    } catch (error: any) {
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