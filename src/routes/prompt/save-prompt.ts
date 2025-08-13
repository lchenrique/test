import { FastifyPluginAsyncZod, ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const savePromptSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
})

const savePromptResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const savePrompt: FastifyPluginAsyncZod = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/save',
    schema: {
      tags: ['prompts'],
      summary: 'Salvar um novo prompt',
      description: 'Salva um prompt com título, conteúdo e metadados opcionais',
      body: savePromptSchema,
      response: {
        201: savePromptResponseSchema,
        400: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { title, content, category, tags, isPublic } = request.body

      try {
        // TODO: Implementar lógica de salvamento do prompt
        // Aqui você pode salvar no banco de dados, arquivo, etc.
        
        const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        const savedPrompt = {
          id: promptId,
          title,
          content,
          category,
          tags,
          isPublic,
          createdAt: now,
          updatedAt: now,
        }

        // Log para debug
        app.log.info(`Prompt salvo: ${promptId} - ${title} (categoria: ${category || 'sem categoria'})`)

        return reply.status(201).send(savedPrompt)
      } catch (error) {
        app.log.error(`Erro ao salvar prompt: ${String(error)}`)
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Erro interno do servidor ao salvar prompt',
        })
      }
    },
  })
}