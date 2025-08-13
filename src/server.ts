import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fastifyStatic from '@fastify/static'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { writeFileSync } from 'fs'
import path from 'path'

import { env } from './config/env'
import { instanceRoutes } from './routes/instances'
import { webhookRoutes } from './routes/webhook'
import { promptRoutes } from './routes/prompt'
import { meRoutes } from './routes/me'
// import { evolutionWebSocket } from './lib/websocket-client'

export async function buildApp() {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          colorize: true,
        },
      },
    },
    disableRequestLogging: false,
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
  }).withTypeProvider<ZodTypeProvider>()

  // Configurar compiladores Zod
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // Configurar CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
    exposedHeaders: ['Authorization'],
  })

  // Configurar Swagger com tratamento de erro robusto
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Sunobot API Server',
        description: 'Servidor para integração com Evolution API do WhatsApp',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apikey',
            in: 'header',
          },
        },
      },
    },
    transform: ({ schema, url }) => {
      try {
        // Verificar se o schema é válido antes de tentar transformar
        if (!schema || typeof schema !== 'object') {
          app.log.warn(`Schema inválido encontrado para URL: ${url}`)
          return {
            schema: {
              type: 'object',
              properties: {},
              description: 'Schema não disponível devido a erro de conversão'
            },
            url,
          }
        }

        return jsonSchemaTransform({ schema, url })
      } catch (error) {
        if(error && error instanceof Error) {
          app.log.warn(`Erro ao transformar schema para URL ${url}: ${String(error)}`)
        }
        
        // Fallback para schemas que não conseguem ser transformados
        return {
          schema: {
            type: 'object',
            properties: {},
            description: 'Schema não disponível devido a erro de conversão'
          },
          url,
        }
      }
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  })

  // Configurar arquivos estáticos
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
  })

  // Registrar rotas
  await app.register(instanceRoutes, { prefix: '/instances' })
  await app.register(webhookRoutes)
  await app.register(promptRoutes, { prefix: '/prompt' })
  await app.register(meRoutes, { prefix: '/me' })

  // Rota de health check (simplificada para debug)
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  })

  // Rota para expor o JSON do Swagger
  app.get('/swagger.json', async () => {
    return app.swagger()
  })

  // Gerar swagger.json após o servidor estar pronto (com tratamento de erro)
  app.ready(() => {
    try {
      const swaggerDoc = app.swagger()
      if (swaggerDoc && typeof swaggerDoc === 'object') {
        writeFileSync(
          path.resolve(process.cwd(), 'swagger.json'),
          JSON.stringify(swaggerDoc, null, 2)
        )
        console.log('✅ swagger.json gerado com sucesso')
      } else {
        console.log('⚠️ Swagger não disponível para geração do arquivo JSON')
      }
    } catch (err) {
      console.error('❌ Erro ao gerar swagger.json:', err)
      // Não interromper o servidor por causa deste erro
    }
  })

  return app
}

async function start() {
  try {
    const app = await buildApp()
    
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    })

    console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`)
    console.log(`📚 Documentação disponível em http://localhost:${env.PORT}/docs`)

  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err)
    process.exit(1)
  }
}

// Iniciar servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  start()
}