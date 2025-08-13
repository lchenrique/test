# 🚀 Evolution API Server

Servidor backend construído com **Fastify**, **Zod** e **TypeScript** para integração com a Evolution API do WhatsApp, seguindo os padrões arquiteturais definidos.

## 📋 Funcionalidades

### 🔌 Gerenciamento de Instâncias
- ✅ **Create Instance** - `POST /instances/create`
- ✅ **Fetch Instances** - `GET /instances`
- ✅ **Instance Connect** - `PUT /instances/connect/:instance`
- ✅ **Restart Instance** - `GET /instances/:instance/restart`
- ✅ **Connection State** - `GET /instances/:instance/state`
- ✅ **Logout Instance** - `DELETE /instances/:instance/logout`
- ✅ **Delete Instance** - `DELETE /instances/:instance`
- ✅ **Set Presence** - `POST /instances/:instance/presence`

## 🛠️ Stack Tecnológica

- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **Zod** - Validação de schemas e geração de tipos
- **Axios** - Cliente HTTP para integração com Evolution API

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
│   └── evolution-api.ts # Cliente Evolution API
├── routes/             # Rotas organizadas por domínio
│   └── instances/      # Rotas de instâncias
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

### Criar uma instância
```bash
curl -X POST http://localhost:3333/instances/create \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "minha-instancia",
    "qrcode": true
  }'
```

### Obter estado da conexão
```bash
curl http://localhost:3333/instances/minha-instancia/state
```

### Definir presença
```bash
curl -X POST http://localhost:3333/instances/minha-instancia/presence \
  -H "Content-Type: application/json" \
  -d '{
    "presence": "available"
  }'
```

## 🎯 Padrões Seguidos

Este projeto segue rigorosamente os padrões arquiteturais definidos no documento `ARCHITECTURE.md`, incluindo:

- ✅ Type Provider Zod para tipagem completa
- ✅ Organização de rotas por domínio
- ✅ Schemas centralizados
- ✅ Configuração de ambiente tipada
- ✅ Documentação automática com Swagger
- ✅ Tratamento de erros padronizado
- ✅ Estrutura modular e escalável