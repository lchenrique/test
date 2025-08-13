import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { evolutionApi } from '../lib/evolution-api'
import {
  meResponseSchema,
  errorResponseSchema,
} from '../schemas'

export const meRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', {
    schema: {
      tags: ['user'],
      description: 'Obter dados do usuário e sua instância padrão',
      response: {
        200: meResponseSchema,
        500: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const defaultInstanceName = 'iddouser-sunobot'
      let userInstance = null
      
      // Tentar buscar a instância específica
      try {
        const instancesResponse = await evolutionApi.fetchInstances(defaultInstanceName)
        console.log('🔍 Resposta completa da Evolution API:', JSON.stringify(instancesResponse.data, null, 2))
        console.log('🔍 Tipo da resposta:', typeof instancesResponse.data)
        console.log('🔍 É array?', Array.isArray(instancesResponse.data))
        
        userInstance = instancesResponse.data
        
        // Se for um array, pegar o primeiro item
        if (Array.isArray(userInstance)) {
          userInstance = userInstance[0]
          console.log('📦 Instância extraída do array:', userInstance)
        }
        
        console.log('✅ Instância encontrada:', userInstance)
      } catch (error: any) {
        // Se retornou 404, a instância não existe
        if (error.response?.status === 404) {
          console.log(`⚠️ Instância ${defaultInstanceName} não encontrada. Criando...`)
          
          // Criar a instância padrão
          const createResponse = await evolutionApi.createInstance({
            instanceName: defaultInstanceName,
            "integration": "WHATSAPP-BAILEYS",
            "webhook": {
              "url": `http://host.docker.internal:3000/webhook/${defaultInstanceName}`,
              "events": [
                "APPLICATION_STARTUP",
                "SEND_MESSAGE",
                "REMOVE_INSTANCE",
                "QRCODE_UPDATED",
                "MESSAGES_UPSERT",
                "MESSAGES_UPDATE",
                "MESSAGES_SET",
                "LOGOUT_INSTANCE",
                "CONNECTION_UPDATE",
                "PRESENCE_UPDATE"
              ]
            }
          })
          
          // Buscar a instância recém-criada
          const updatedInstancesResponse = await evolutionApi.fetchInstances(defaultInstanceName)
          userInstance = updatedInstancesResponse.data
          
          // Se for um array, pegar o primeiro item
          if (Array.isArray(userInstance)) {
            userInstance = userInstance[0]
          }
          
          console.log('✅ Instância criada e encontrada:', userInstance)
        } else {
          // Se não for 404, rejeitar o erro
          throw error
        }
      }
      
      // Verificar se conseguimos obter a instância
      if (!userInstance) {
        throw new Error('Não foi possível obter ou criar a instância padrão')
      }
      
      // Dados fictícios do usuário
      const userData = {
        user: {
          id: 'user-123',
          name: 'Usuário Padrão',
          email: 'usuario@exemplo.com',
        },
        instance: {
          ...userInstance,
          disconnectionReasonCode: userInstance.disconnectionReasonCode ? String(userInstance.disconnectionReasonCode) : null,
        },
      }
      
      console.log('📤 Dados finais a serem retornados:', JSON.stringify(userData, null, 2))
      console.log('📤 Tipo do userData:', typeof userData)
      console.log('📤 Tipo do userData.instance:', typeof userData.instance)
      console.log('📤 userData.instance tem name?', 'name' in userData.instance)
      console.log('📤 userData.instance tem id?', 'id' in userData.instance)
      
      return userData
    } catch (error: any) {
      console.error('Erro ao obter dados do usuário:', error.message)
      console.error('Detalhes do erro:', error.response?.data)
      
      const statusCode = error.response?.status || 500
      const message = error.response?.data?.message || error.message || 'Erro interno do servidor'

      return reply.status(statusCode).send({
        statusCode,
        error: error.response?.statusText || 'Internal Server Error',
        message,
      })
    }
  })
}