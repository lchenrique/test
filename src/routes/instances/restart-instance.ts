import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { evolutionApi } from '../../lib/evolution-api'
import {
  instanceParamsSchema,
  errorResponseSchema,
} from '../../schemas'

export const restartInstance: FastifyPluginAsyncZod = async (app) => {
  app.post('/:instance/restart', {
    schema: {
      tags: ['instances'],
      description: 'Reiniciar uma instância do WhatsApp',
      params: instanceParamsSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.any(), // Permite qualquer estrutura de dados da Evolution API
        }),
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: z.object({
          success: z.boolean(),
          message: z.string(),
          error: z.any(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { instance } = request.params
      
      console.log('🔄 Tentando reiniciar instância:', instance)
      console.log('🔑 Headers da requisição:', JSON.stringify(request.headers, null, 2))
      console.log('📋 Parâmetros:', JSON.stringify(request.params, null, 2))
      console.log('🌐 URL da Evolution API:', process.env.EVOLUTION_API_URL)
      
      // Validar API key
      const apiKey = request.headers.apikey as string
      if (!apiKey) {
        console.log('❌ API key não fornecida')
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'API key é obrigatória',
        })
      }
      
      // Primeiro, vamos verificar se a instância existe e está conectada
      console.log('🔍 Verificando estado da conexão antes do restart...')
      try {
        const connectionState = await evolutionApi.getConnectionState(instance)
        console.log('✅ Estado da conexão verificado:', JSON.stringify(connectionState.data, null, 2))
      } catch (connectionError: any) {
        console.error('⚠️ Erro ao verificar estado da conexão:', connectionError.response?.data)
        // Continuamos mesmo se der erro na verificação
      }
      
      console.log('🔄 Iniciando restart da instância...')
      const response = await evolutionApi.restartInstance(instance)
      console.log('✅ Resposta completa da Evolution API:', JSON.stringify(response.data, null, 2))
      
      return reply.status(200).send({
        success: true,
        message: 'Instância reiniciada com sucesso',
        data: response.data,
      })
    } catch (error: any) {
      console.error('❌ Erro completo:', JSON.stringify(error, null, 2))
      console.error('❌ Erro ao reiniciar instância:', error.message)
      console.error('❌ Status do erro:', error.response?.status)
      console.error('❌ Dados do erro:', error.response?.data)
      console.error('❌ URL que causou erro:', error.config?.url)
      console.error('❌ Método usado:', error.config?.method)
      
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.response?.data || error.message,
      })
    }
  })
}