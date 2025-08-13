import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { evolutionApi } from '../../lib/evolution-api'
import {
  fetchInstancesResponseSchema,
  fetchInstancesQuerySchema,
  errorResponseSchema,
} from '../../schemas'

export const fetchInstances: FastifyPluginAsyncZod = async (app) => {
  app.get('/', {
    schema: {
      tags: ['instances'],
      description: 'Buscar todas as instâncias ou filtrar por instanceName/instanceId',
      querystring: fetchInstancesQuerySchema,
      // Removendo temporariamente a validação de resposta para debug
      // response: {
      //   200: fetchInstancesResponseSchema,
      //   500: errorResponseSchema,
      // },
    },
  }, async (request, reply) => {
    try {
      const { instanceName, instanceId } = request.query
      
      console.log('Tentando buscar instâncias...')
      console.log('Query params:', { instanceName, instanceId })
      console.log('Evolution API URL:', process.env.EVOLUTION_API_URL)
      
      // Se instanceName for fornecido, passar para a Evolution API
      // Caso contrário, buscar todas as instâncias
      const response = await evolutionApi.fetchInstances(instanceName)
      
      console.log('Resposta da Evolution API:', response.data)

      let instances = response.data

      // Filtrar por instanceId se fornecido (instanceName já foi filtrado pela API)
      if (instanceId) {
        instances = instances.filter((inst: any) => 
          inst.instance.instanceId === instanceId
        )
      }

      return instances
    } catch (error: any) {
      console.error('Erro ao buscar instâncias:', error.message)
      console.error('Detalhes do erro:', error.response?.data)
      
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