import axios, { AxiosInstance } from 'axios'
import { env } from '../config/env'


export interface createInstanceInput {
  instanceName: string
  integration: string
  qrcode?:boolean,
  "webhook"?: {
    "url": string,
    "events": string[]
  }
} 

class EvolutionApiClient {
  private client: AxiosInstance

  constructor() {
    console.log('🔑 API Key configurada:', env.EVOLUTION_API_KEY ? 'SIM' : 'NÃO')
    console.log('🔑 API Key (primeiros 10 chars):', env.EVOLUTION_API_KEY?.substring(0, 10) + '...')
    console.log('🌐 URL da API:', env.EVOLUTION_API_URL)
    
    this.client = axios.create({
      baseURL: env.EVOLUTION_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.EVOLUTION_API_KEY,
        'Authorization': `Bearer ${env.EVOLUTION_API_KEY}`,
      },
      timeout: 30000,
    })

    // Interceptor para log de requests
    this.client.interceptors.request.use((config) => {
      console.log('📤 Fazendo requisição para:', config.url)
      console.log('📤 Headers:', JSON.stringify(config.headers, null, 2))
      console.log('📤 Data:', JSON.stringify(config.data, null, 2))
      return config
    })

    // Interceptor para log de responses
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ Resposta recebida:', response.status)
        console.log('✅ Data:', JSON.stringify(response.data, null, 2))
        return response
      },
      (error) => {
        console.error('❌ Erro na requisição:', error.response?.status)
        console.error('❌ Error data:', JSON.stringify(error.response?.data, null, 2))
        console.error('❌ Error headers:', JSON.stringify(error.response?.headers, null, 2))
        return Promise.reject(error)
      }
    )
  }
  

  // Criar instância
  async createInstance(data: createInstanceInput) {
    return this.client.post('/instance/create', data)
  }

  // Buscar instâncias
  async fetchInstances(instanceName?:string) {
    return this.client.get('/instance/fetchInstances', {
      params: {
        instanceName,
      }
    })
  }

  // Conectar instância
  async connectInstance(instanceName: string) {
    return this.client.get(`/instance/connect/${instanceName}`)
  }

  // Reiniciar instância
  async restartInstance(instanceName: string) {
    return this.client.post(`/instance/restart/${instanceName}`)
  }

  // Fazer logout da instância
  async logoutInstance(instanceName: string) {
    return this.client.delete(`/instance/logout/${instanceName}`)
  }

  // Estado da conexão
  async getConnectionState(instanceName: string) {
    console.log('🔍 Buscando estado da conexão para:', instanceName)
    const response = await this.client.get(`/instance/connectionState/${instanceName}`)
    console.log('✅ Estado da conexão:', response.data?.state)
    return response
  }

 

  // Deletar instância
  async deleteInstance(instanceName: string) {
    return this.client.delete(`/instance/delete/${instanceName}`)
  }

  // Definir presença
  async setPresence(instanceName: string, data: any) {
    return this.client.post(`/chat/presence/${instanceName}`, data)
  }

  // Configurar webhook
  async setWebhook(instanceName: string, data: any) {
    return this.client.post(`/webhook/set/${instanceName}`, data)
  }

  // Buscar configuração do webhook
  async getWebhook(instanceName: string) {
    return this.client.get(`/webhook/find/${instanceName}`)
  }

  // Enviar mensagem de texto
  async sendTextMessage(instanceName: string, data: { number: string; text: string }) {
    return this.client.post(`/message/sendText/${instanceName}`, data)
  }

  // Enviar mídia (imagem, vídeo, áudio, documento)
  async sendMediaMessage(instanceName: string, data: any) {
    return this.client.post(`/message/sendMedia/${instanceName}`, data)
  }
}

export const evolutionApi = new EvolutionApiClient()