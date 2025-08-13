import { z } from 'zod'

// Schema de resposta de erro padronizada
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  code: z.string().optional(),
  message: z.string(),
})

// Schema de resposta de sucesso genérica
export const successResponseSchema = z.object({
  data: z.unknown().optional(),
  message: z.string(),
})

// Schema para nome de instância
export const instanceNameSchema = z.object({
  instance: z.string().min(1, 'Nome da instância é obrigatório'),
})

// Schema para parâmetros de rota com instância
export const instanceParamsSchema = z.object({
  instance: z.string().min(1, 'Nome da instância é obrigatório'),
})

// Tipos exportados
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SuccessResponse = z.infer<typeof successResponseSchema>
export type InstanceParams = z.infer<typeof instanceParamsSchema>