import { FastifyInstance } from 'fastify'
import { buildApp } from '../server'

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp()
  await app.ready()
  return app
}