import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  EVOLUTION_API_URL: z.string().url('URL da Evolution API é obrigatória'),
  EVOLUTION_API_KEY: z.string().min(1, 'API Key da Evolution API é obrigatória'),
  OPEN_ROUTER_API_KEY: z.string().min(1, 'API Key do OpenRouter é obrigatória'),
})

export type EnvConfig = z.infer<typeof envSchema>

export const env = envSchema.parse({
  PORT: Number(process.env.PORT) || 3333,
  NODE_ENV: process.env.NODE_ENV || 'development',
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
  OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY,
}) satisfies EnvConfig