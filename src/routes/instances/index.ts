import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createInstance } from './create-instance'
import { fetchInstances } from './fetch-instances'
import { connectInstance } from './connect-instance'
import { restartInstance } from './restart-instance'
import { connectionState } from './connection-state'
import { logoutInstance } from './logout-instance'
import { deleteInstance } from './delete-instance'
import { setPresence } from './set-presence'
import { setWebhook } from './set-webhook'
import { getWebhook } from './get-webhook'
import { instanceEventsRoute } from './events'

export const instanceRoutes: FastifyPluginAsyncZod = async (app) => {
  // Registro das rotas de instâncias
  await app.register(createInstance)
  await app.register(fetchInstances)
  await app.register(connectInstance)
  await app.register(connectionState)
  await app.register(setWebhook)
  await app.register(getWebhook)
  await app.register(restartInstance)
  await app.register(logoutInstance)
  await app.register(instanceEventsRoute)
  // await app.register(deleteInstance, { prefix: '/:instance/delete' })
  // await app.register(setPresence, { prefix: '/:instance/presence' })
}