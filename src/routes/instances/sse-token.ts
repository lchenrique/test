import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { instanceParamsSchema, errorResponseSchema } from '../../schemas'
import { randomBytes } from 'crypto'

// Store para tokens temporários (em produção, usar Redis)
const sseTokens = new Map<string, { instanceName: string, expiresAt: number }>()

// Limpar tokens expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of sseTokens.entries()) {
    if (data.expiresAt < now) {
      sseTokens.delete(token)
    }
  }
}, 5 * 60 * 1000)

export function validateSSEToken(token: string, instanceName: string): boolean {
  const tokenData = sseTokens.get(token)
  if (!tokenData) return false
  
  if (tokenData.expiresAt < Date.now()) {
    sseTokens.delete(token)
    return false
  }
  
  return tokenData.instanceName === instanceName
}

export const sseTokenRoute: FastifyPluginAsyncZod = async (app) => {
  app.post('/:instance/sse-token', {
    schema: {
      tags: ['instances'],
      description: 'Gerar token temporário para conexão SSE',
      params: instanceParamsSchema,
      response: {
        200: z.object({
          token: z.string(),
          expiresIn: z.number(),
          sseUrl: z.string(),
        }),
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

      const { instance } = request.params
      
      // Gerar token temporário (válido por 10 minutos)
      const token = randomBytes(32).toString('hex')
      const expiresAt = Date.now() + (10 * 60 * 1000) // 10 minutos
      
      sseTokens.set(token, {
        instanceName: instance,
        expiresAt
      })

      const port = process.env.PORT || 3333
      const sseUrl = `http://localhost:${port}/instances/${instance}/events?token=${token}`

      console.log(`🎫 Token SSE gerado para instância: ${instance} (expira em 10min)`)

      return {
        token,
        expiresIn: 600, // 10 minutos em segundos
        sseUrl,
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar token SSE:', error.message)
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
      })
    }
  })
}