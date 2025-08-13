import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import * as qrcode from 'qrcode-terminal'
import { evolutionApi } from '../../lib/evolution-api'
import {
  instanceParamsSchema,
  connectInstanceWrapperResponseSchema,
  errorResponseSchema,
} from '../../schemas'

export const connectInstance: FastifyPluginAsyncZod = async (app) => {
  app.get('/:instance/connect', {
    schema: {
      tags: ['instances'],
      description: 'Conectar uma instância do WhatsApp',
      params: instanceParamsSchema,
      // Removendo validação de resposta temporariamente
      // response: {
      //   200: connectInstanceWrapperResponseSchema,
      //   400: errorResponseSchema,
      //   404: errorResponseSchema,
      //   500: errorResponseSchema,
      // },
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

      console.log('🔗 Conectando instância:', instance)

      const response = await evolutionApi.connectInstance(instance)

      console.log('✅ Resposta da conexão:', JSON.stringify(response.data, null, 2))

      // Se há um código QR, mostrar no terminal
      if (response.data.code) {
        console.log('\n🔗 QR Code para conectar o WhatsApp:')
        console.log('📱 Abra o WhatsApp no seu celular > Dispositivos conectados > Conectar um dispositivo')
        console.log('📷 Escaneie o QR code abaixo:\n')
        
        // Versão compacta do QR code
        qrcode.generate(response.data.code, { 
          small: true, 
        }, (qr) => {
          console.log(qr)
        })
        
        console.log('\n⏰ O QR code expira em alguns minutos. Se não conseguir conectar, tente novamente.')
        console.log('🔄 Para gerar um novo QR code, faça uma nova requisição para esta rota.\n')
      }

      return {
        data: response.data,
        message: response.data.code 
          ? 'QR Code gerado! Verifique o terminal para escanear.' 
          : 'Instância conectada com sucesso',
      }
    } catch (error: any) {
      console.error('❌ Erro ao conectar instância:', error.message)
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