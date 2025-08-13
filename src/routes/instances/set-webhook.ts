import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { evolutionApi } from '../../lib/evolution-api'
import { instanceParamsSchema, errorResponseSchema } from '../../schemas'

// Schema para configurar webhook
const setWebhookSchema = z.object({
  webhook: z.string().url('URL do webhook deve ser válida'),
  webhookByEvents: z.boolean().optional().default(true),
  events: z.array(z.string()).optional().default([
    'APPLICATION_STARTUP',
    'QRCODE_UPDATED',
    'CONNECTION_UPDATE',
    'MESSAGES_SET',
    'MESSAGES_UPSERT',
    'MESSAGES_UPDATE',
    'SEND_MESSAGE',
    'CONTACTS_SET',
    'CONTACTS_UPSERT',
    'PRESENCE_UPDATE',
    'CHATS_SET',
    'CHATS_UPSERT',
    'CHATS_UPDATE',
  ]),
})

export const setWebhook: FastifyPluginAsyncZod = async (app) => {
  app.post('/:instance/webhook', {
    schema: {
      tags: ['instances'],
      description: 'Configurar webhook para uma instância',
      params: instanceParamsSchema,
      body: setWebhookSchema,
      response: {
        200: z.object({
          data: z.unknown(),
          message: z.string(),
        }),
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
      const webhookData = request.body

      console.log(`🔗 Configurando webhook para instância: ${instance}`)
      console.log(`📡 URL do webhook: ${webhookData.webhook}`)
      console.log(`📋 Eventos: ${webhookData.events?.join(', ')}`)

      const response = await evolutionApi.setWebhook(instance, webhookData)

      console.log('✅ Webhook configurado com sucesso!')

      return {
        data: response.data,
        message: 'Webhook configurado com sucesso',
      }
    } catch (error: any) {
      console.error('❌ Erro ao configurar webhook:', error.message)
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

  // Rota para configurar webhook automaticamente apontando para este servidor
  app.post('/:instance/webhook/auto', {
    schema: {
      tags: ['instances'],
      description: 'Configurar webhook automaticamente para este servidor',
      params: instanceParamsSchema,
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
      
      // Construir URL do webhook automaticamente
      const port = process.env.PORT || 3333
      const webhookUrl = `http://localhost:${port}/webhook/${instance}`
      
      const webhookData = {
        webhook: webhookUrl,
        webhookByEvents: true,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED', 
          'CONNECTION_UPDATE',
          'MESSAGES_SET',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_SET',
          'CONTACTS_UPSERT',
          'CONTACTS_UPDATE',
          'PRESENCE_UPDATE',
          'CHATS_SET',
          'CHATS_UPSERT',
          'CHATS_UPDATE',
          'CHATS_DELETE',
          'GROUPS_UPSERT',
          'GROUP_UPDATE',
          'GROUP_PARTICIPANTS_UPDATE',
          'LOGOUT_INSTANCE',
          'REMOVE_INSTANCE',
        ],
      }

      console.log(`🔗 Configurando webhook automático para instância: ${instance}`)
      console.log(`📡 URL do webhook: ${webhookUrl}`)

      const response = await evolutionApi.setWebhook(instance, webhookData)

      console.log('✅ Webhook automático configurado com sucesso!')
      console.log('🎯 Agora os eventos serão enviados para este servidor!')

      return {
        data: response.data,
        message: `Webhook configurado automaticamente para ${webhookUrl}`,
        webhookUrl,
      }
    } catch (error: any) {
      console.error('❌ Erro ao configurar webhook automático:', error.message)
      
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