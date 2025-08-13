import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { savePrompt } from './save-prompt'

export const promptRoutes: FastifyPluginAsyncZod = async (app) => {
  // Registrar todas as rotas de prompt
  await app.register(savePrompt)
  
  // TODO: Adicionar outras rotas de prompt aqui quando necessário
  // await app.register(listPrompts)
  // await app.register(getPrompt)
  // await app.register(updatePrompt)
  // await app.register(deletePrompt)
}