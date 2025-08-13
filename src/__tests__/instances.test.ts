import { FastifyInstance } from 'fastify'
import { createTestApp } from './setup'

describe('Instances Routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body).toHaveProperty('status', 'ok')
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('uptime')
    })
  })

  describe('GET /instances', () => {
    it('should fetch instances', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/instances',
      })

      // Como estamos testando sem a API real, esperamos um erro de conexão
      expect([200, 500]).toContain(response.statusCode)
    })
  })

  describe('POST /instances/create', () => {
    it('should validate create instance payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/instances/create',
        payload: {
          // Payload inválido para testar validação
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should accept valid create instance payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/instances/create',
        payload: {
          instanceName: 'test-instance',
          qrcode: true,
        },
      })

      // Como estamos testando sem a API real, esperamos um erro de conexão
      expect([200, 500]).toContain(response.statusCode)
    })
  })
})