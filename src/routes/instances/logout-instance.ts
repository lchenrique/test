import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { evolutionApi } from '../../lib/evolution-api'
import {
  instanceParamsSchema,
  successResponseSchema,
  errorResponseSchema,
} from '../../schemas'

export const logoutInstance: FastifyPluginAsyncZod = async (app) => {
  app.delete('/:instance/logout', {
    schema: {
      tags: ['instances'],
      description: 'Fazer logout de uma instância do WhatsApp',
      params: instanceParamsSchema,
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

      const response = await evolutionApi.logoutInstance(instance)

      return {
        data: response.data,
        message: 'Logout realizado com sucesso',
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