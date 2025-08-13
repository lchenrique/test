import { z } from 'zod'

// Schema para criar instância (apenas campos essenciais)
export const createInstanceSchema = z.object({
  instanceName: z.string().min(1, 'Nome da instância é obrigatório'),
  integration: z.enum(['WHATSAPP-BAILEYS', 'WHATSAPP-BUSINESS']).optional(),
})

// Schema para conectar instância (sem body necessário)
export const connectInstanceSchema = z.object({}).optional()

// Schema para definir presença
export const setPresenceSchema = z.object({
  presence: z.enum(['available', 'unavailable', 'composing', 'recording', 'paused']),
})

// Schema de resposta da conexão
export const connectInstanceResponseSchema = z.object({
  pairingCode: z.string().nullable().optional(),
  code: z.string().optional(),
  count: z.number().optional(),
  base64: z.string().optional(),
})

// Schema de resposta do estado da conexão
export const connectionStateResponseSchema = z.object({
  instance: z.object({
    instanceName: z.string(),
    state: z.enum(['close', 'connecting', 'open']),
  }),
})

// Schema para resposta do wrapper de connection state
export const connectionStateWrapperResponseSchema = z.object({
  data: connectionStateResponseSchema,
  message: z.string(),
})

// Schema para resposta do wrapper de conexão
export const connectInstanceWrapperResponseSchema = z.object({
  data: connectInstanceResponseSchema,
  message: z.string(),
})

// Schema de resposta da lista de instâncias (baseado na documentação real da Evolution API)
export const instanceSchema = z.object({
  instance: z.object({
    instanceName: z.string(),
    instanceId: z.string().optional(),
    owner: z.string().optional(),
    profileName: z.string().optional(),
    profilePictureUrl: z.string().nullable().optional(),
    profileStatus: z.string().optional(),
    status: z.string(),
    serverUrl: z.string().optional(),
    apikey: z.string().optional(),
    integration: z.object({
      integration: z.string().optional(),
      token: z.string().optional(),
      webhook_wa_business: z.string().optional(),
    }).optional(),
  }),
})

// A Evolution API retorna um array direto, não um objeto com data
export const fetchInstancesResponseSchema = z.array(instanceSchema)

// Schema de resposta de criação de instância (baseado na documentação da Evolution API)
export const createInstanceResponseSchema = z.object({
  instance: z.object({
    instanceName: z.string(),
    instanceId: z.string(),
    status: z.string(),
  }),
  hash: z.object({
    apikey: z.string(),
  }),
  webhook: z.string().optional(),
  events: z.array(z.string()).optional(),
  qrcode: z.object({
    code: z.string(),
    base64: z.string(),
  }).optional(),
})

// Schema para a resposta do wrapper (nossa API)
export const createInstanceWrapperResponseSchema = z.object({
  data: createInstanceResponseSchema,
  message: z.string(),
})

// Schema para query parameters da rota fetch-instances
export const fetchInstancesQuerySchema = z.object({
  instanceName: z.string().optional(),
  instanceId: z.string().optional(),
})

// Schema para resposta da rota /me
export const meResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  instance: z.object({
    id: z.string(),
    name: z.string(),
    connectionStatus: z.string(),
    ownerJid: z.string().nullable().optional(),
    profileName: z.string().nullable().optional(),
    profilePicUrl: z.string().nullable().optional(),
    integration: z.string(),
    number: z.string().nullable().optional(),
    businessId: z.string().nullable().optional(),
    token: z.string(),
    clientName: z.string(),
    disconnectionReasonCode: z.string().nullable().optional(),
    disconnectionObject: z.unknown().nullable().optional(),
    disconnectionAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    Chatwoot: z.unknown().nullable().optional(),
    Proxy: z.unknown().nullable().optional(),
    Rabbitmq: z.unknown().nullable().optional(),
    Sqs: z.unknown().nullable().optional(),
    Websocket: z.unknown().nullable().optional(),
    Setting: z.object({
      id: z.string(),
      rejectCall: z.boolean(),
      msgCall: z.string(),
      groupsIgnore: z.boolean(),
      alwaysOnline: z.boolean(),
      readMessages: z.boolean(),
      readStatus: z.boolean(),
      syncFullHistory: z.boolean(),
      wavoipToken: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      instanceId: z.string(),
    }).optional(),
    _count: z.object({
      Message: z.number(),
      Contact: z.number(),
      Chat: z.number(),
    }).optional(),
  }),
})

// Tipos exportados
export type CreateInstanceInput = z.infer<typeof createInstanceSchema>
export type ConnectInstanceInput = z.infer<typeof connectInstanceSchema>
export type SetPresenceInput = z.infer<typeof setPresenceSchema>
export type FetchInstancesQuery = z.infer<typeof fetchInstancesQuerySchema>
export type ConnectionStateResponse = z.infer<typeof connectionStateResponseSchema>
export type ConnectionStateWrapperResponse = z.infer<typeof connectionStateWrapperResponseSchema>
export type Instance = z.infer<typeof instanceSchema>
export type FetchInstancesResponse = z.infer<typeof fetchInstancesResponseSchema>
export type CreateInstanceResponse = z.infer<typeof createInstanceResponseSchema>
export type CreateInstanceWrapperResponse = z.infer<typeof createInstanceWrapperResponseSchema>
export type ConnectInstanceResponse = z.infer<typeof connectInstanceResponseSchema>
export type ConnectInstanceWrapperResponse = z.infer<typeof connectInstanceWrapperResponseSchema>
export type MeResponse = z.infer<typeof meResponseSchema>