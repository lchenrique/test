# 🤖 Bot Manager - Gerenciador de Bots WhatsApp

Plataforma completa para gerenciamento de bots WhatsApp construída com **Fastify**, **Zod** e **TypeScript**. Integra com a Evolution API para fornecer uma interface robusta de controle de instâncias, eventos em tempo real e funcionalidades de IA.

## 🎯 Sobre o Projeto

Este é um **gerenciador de bots WhatsApp** que permite:
- Criar e gerenciar múltiplas instâncias de bots
- Monitorar conexões em tempo real via Server-Sent Events (SSE)
- Receber webhooks de eventos do WhatsApp
- Integrar com serviços de IA para respostas automatizadas
- Interface web para controle visual das instâncias

## 📋 Funcionalidades

### 🔌 Gerenciamento de Instâncias
- ✅ **Criar Instância** - `POST /instances/create`
- ✅ **Listar Instâncias** - `GET /instances`
- ✅ **Conectar Instância** - `PUT /instances/connect/:instance`
- ✅ **Reiniciar Instância** - `GET /instances/:instance/restart`
- ✅ **Estado da Conexão** - `GET /instances/:instance/state`
- ✅ **Logout Instância** - `DELETE /instances/:instance/logout`
- ✅ **Deletar Instância** - `DELETE /instances/:instance`
- ✅ **Definir Presença** - `POST /instances/:instance/presence`

### 📡 Eventos em Tempo Real
- ✅ **Server-Sent Events (SSE)** - `GET /instances/:instance/events`
- ✅ **Webhooks** - `POST /webhook/:instance`
- ✅ **Eventos de Conexão** - Status, QR Code, mensagens
- ✅ **Broadcast para Frontend** - Notificações em tempo real

### 🧠 Integração com IA
- ✅ **Processamento de Mensagens** - Análise automática
- ✅ **Respostas Inteligentes** - Via serviços de IA
- ✅ **Configuração de Prompts** - Personalização de comportamento

## 🛠️ Stack Tecnológica

### Backend
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **Zod** - Validação de schemas e geração de tipos
- **Axios** - Cliente HTTP para integração com Evolution API
- **Server-Sent Events (SSE)** - Comunicação em tempo real
- **Webhooks** - Recebimento de eventos do WhatsApp

### Frontend
- **React 19+** - Interface de usuário moderna
- **Next.js** - Framework React com SSR
- **Tailwind CSS v4** - Estilização utilitária
- **React Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado local

### Integrações
- **Evolution API** - API do WhatsApp
- **Supabase** - Backend-as-a-Service
- **Serviços de IA** - Processamento inteligente de mensagens

## 🚀 Como usar

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3333
NODE_ENV=development
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
```

### 3. Executar em desenvolvimento
```bash
pnpm dev
```

### 4. Build para produção
```bash
pnpm build
pnpm start
```

## 📚 Documentação

Após iniciar o servidor, acesse:
- **API Docs**: http://localhost:3333/docs
- **Health Check**: http://localhost:3333/health

## 🏗️ Estrutura do Projeto

```
src/
├── config/             # Configurações do sistema
│   └── env.ts          # Validação de variáveis de ambiente
├── lib/                # Integrações externas
│   ├── evolution-api.ts # Cliente Evolution API
│   ├── ai-client.ts    # Cliente de IA
│   └── websocket-client.ts # Cliente WebSocket
├── routes/             # Rotas organizadas por domínio
│   ├── instances/      # Rotas de instâncias
│   │   ├── index.ts    # CRUD de instâncias
│   │   ├── events.ts   # Server-Sent Events
│   │   └── sse-token.ts # Tokens SSE temporários
│   ├── webhook.ts      # Recebimento de webhooks
│   ├── me.ts          # Informações do usuário
│   └── prompt/        # Configuração de prompts IA
├── services/           # Serviços de negócio
│   └── ai-service.ts   # Processamento com IA
├── schemas/            # Schemas Zod para validação
│   ├── instances.ts    # Schemas de instâncias
│   ├── shared.ts       # Schemas compartilhados
│   └── index.ts        # Exportações centralizadas
└── server.ts           # Arquivo principal do servidor
```

## 🔧 Scripts Disponíveis

- `pnpm dev` - Executar em modo desenvolvimento
- `pnpm build` - Build para produção
- `pnpm start` - Executar versão de produção
- `pnpm format` - Formatar código com Biome
- `pnpm lint` - Verificar código com Biome

## 📝 Exemplos de Uso

### Criar uma instância de bot
```bash
curl -X POST http://localhost:3333/instances/create \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "meu-bot",
    "qrcode": true
  }'
```

### Conectar via Server-Sent Events (SSE)
```javascript
// Frontend - Conectar aos eventos em tempo real
const eventSource = new EventSource('/instances/meu-bot/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento recebido:', data);
  
  switch(data.type) {
    case 'connection.established':
      console.log('Conexão SSE estabelecida');
      break;
    case 'qrcode.updated':
      console.log('QR Code atualizado:', data.data.qrcode);
      break;
    case 'connection.update':
      console.log('Status da conexão:', data.data.state);
      break;
  }
};
```

### Obter estado da conexão
```bash
curl http://localhost:3333/instances/meu-bot/state
```

### Configurar webhook (Evolution API)
```bash
# Configure o webhook na Evolution API para receber eventos
curl -X POST https://sua-evolution-api.com/webhook/set/meu-bot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://seu-servidor.com/webhook/meu-bot",
    "events": ["messages.upsert", "connection.update", "qrcode.updated"]
  }'
```

## 📡 Sistema de Eventos em Tempo Real

### Server-Sent Events (SSE)
O sistema utiliza SSE para comunicação em tempo real entre backend e frontend:

- **Conexão persistente**: Mantém conexão aberta para cada instância
- **Eventos automáticos**: Notificações instantâneas de mudanças de estado
- **Heartbeat**: Keep-alive automático a cada 30 segundos
- **Cleanup automático**: Remoção de conexões inativas

### Tipos de Eventos
```typescript
// Eventos enviados via SSE
type EventType = 
  | 'connection.established'  // Conexão SSE iniciada
  | 'connection.status'       // Status inicial da instância
  | 'connection.update'       // Mudança de estado da conexão
  | 'qrcode.updated'         // Novo QR Code gerado
  | 'messages.upsert'        // Nova mensagem recebida
  | 'connection.error'       // Erro na conexão
```

### Webhooks
Recebe eventos da Evolution API e os retransmite via SSE:

- **Endpoint**: `POST /webhook/:instanceName`
- **Processamento**: Filtra e formata eventos
- **Broadcast**: Envia para todas as conexões SSE ativas
- **Integração IA**: Processa mensagens automaticamente

## 🎯 Padrões Seguidos

Este projeto segue rigorosamente os padrões arquiteturais definidos no documento `ARCHITECTURE.md`, incluindo:

- ✅ Type Provider Zod para tipagem completa
- ✅ Organização de rotas por domínio
- ✅ Schemas centralizados
- ✅ Configuração de ambiente tipada
- ✅ Documentação automática com Swagger
- ✅ Tratamento de erros padronizado
- ✅ Estrutura modular e escalável
- ✅ Comunicação em tempo real via SSE
- ✅ Sistema de webhooks robusto
- ✅ Integração com serviços de IA