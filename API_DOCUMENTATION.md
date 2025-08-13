# 📚 Documentação da API - Evolution API Wrapper

## 🌐 Informações Gerais

- **Base URL**: `http://localhost:3333`
- **Autenticação**: Header `apikey` obrigatório para rotas protegidas
- **Content-Type**: `application/json`
- **Documentação Swagger**: `http://localhost:3333/docs`

---

## 🏥 Health Check

### GET /health
Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

---

## 👤 Rota do Usuário

### GET /me
Obtém dados do usuário e sua instância padrão. Se a instância não existir, ela será criada automaticamente.

**Headers:**
- `apikey: {sua-api-key}`

**Resposta:**
```json
{
  "user": {
    "id": "user-123",
    "name": "Usuário Padrão",
    "email": "usuario@exemplo.com"
  },
  "instance": {
    "instance": {
      "instanceName": "iddouser-sunobot",
      "instanceId": "abc123",
      "status": "connected",
      "profileName": "Meu Bot",
      "profilePictureUrl": null,
      "profileStatus": "Disponível"
    }
  }
}
```

**Comportamento:**
- Verifica se existe uma instância com nome `iddouser-sunobot`
- Se não existir, cria automaticamente
- Retorna dados fictícios do usuário + instância

---

## 📱 Rotas de Instâncias

### GET /instances
Lista todas as instâncias disponíveis ou filtra por parâmetros específicos.

**Headers:**
- `Accept: application/json`

**Query Parameters (opcionais):**
- `instanceName` (string): Filtrar por nome da instância
- `instanceId` (string): Filtrar por ID da instância

**Exemplos:**
- `GET /instances` - Lista todas as instâncias
- `GET /instances?instanceName=iddouser-sunobot` - Filtra por nome
- `GET /instances?instanceId=abc123` - Filtra por ID

**Resposta:**
```json
[
  {
    "instance": {
      "instanceName": "test-instance",
      "instanceId": "abc123",
      "status": "connected",
      "profileName": "Meu Bot",
      "profilePictureUrl": null,
      "profileStatus": "Disponível"
    }
  }
]
```

---

### POST /instances
Cria uma nova instância do WhatsApp.

**Headers:**
- `Content-Type: application/json`
- `apikey: {sua-api-key}`

**Body:**
```json
{
  "instanceName": "test-instance",
  "integration": "WHATSAPP-BAILEYS"
}
```

**Resposta (201):**
```json
{
  "data": {
    "instanceName": "test-instance",
    "integration": "WHATSAPP-BAILEYS",
    "status": "created"
  },
  "message": "Instância criada com sucesso"
}
```

---

### POST /instances/debug
Endpoint de debug para criar instância sem validação Zod.

**Headers:**
- `Content-Type: application/json`
- `apikey: {sua-api-key}`

**Body:**
```json
{
  "instanceName": "test-instance",
  "integration": "WHATSAPP-BAILEYS"
}
```

---

### GET /instances/{instanceName}/connect
Conecta uma instância específica ao WhatsApp.

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Resposta:**
```json
{
  "data": {
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "connecting"
  }
}
```

---

### GET /instances/{instanceName}/connectionState
Verifica o estado atual da conexão de uma instância.

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Resposta:**
```json
{
  "data": {
    "state": "open",
    "status": "Conectado"
  }
}
```

**Estados possíveis:**
- `open`: Conectado
- `connecting`: Conectando
- `close`: Desconectado

---

### GET /instances/{instanceName}/events
Stream de eventos em tempo real via Server-Sent Events (SSE).

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Eventos SSE:**
- `connection.update`: Atualização do status da conexão
- `qrcode.updated`: Novo QR Code disponível
- `message.received`: Nova mensagem recebida

---

### POST /instances/{instanceName}/restart
Reinicia uma instância específica.

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Resposta:**
```json
{
  "data": {
    "status": "restarting"
  },
  "message": "Instância reiniciada com sucesso"
}
```

---

### DELETE /instances/{instanceName}/logout
Faz logout de uma instância específica.

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Resposta:**
```json
{
  "data": {
    "status": "logged_out"
  },
  "message": "Logout realizado com sucesso"
}
```

---

### POST /instances/{instanceName}/presence
Define a presença de uma instância no WhatsApp.

**Headers:**
- `Content-Type: application/json`
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Body:**
```json
{
  "presence": "available"
}
```

**Valores de presença:**
- `available`: Disponível
- `unavailable`: Indisponível
- `composing`: Digitando
- `recording`: Gravando áudio
- `paused`: Pausado

---

### GET /instances/{instanceName}/webhook
Verifica a configuração atual do webhook de uma instância.

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Resposta:**
```json
{
  "data": {
    "webhook": "http://localhost:3333/webhook/test-instance",
    "events": ["messages", "connection"]
  }
}
```

---

### POST /instances/{instanceName}/webhook
Configura o webhook de uma instância.

**Headers:**
- `Content-Type: application/json`
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Body:**
```json
{
  "url": "http://localhost:3333/webhook/test-instance",
  "events": ["messages", "connection"]
}
```

---

### POST /instances/{instanceName}/webhook/auto
Configura automaticamente o webhook apontando para este servidor.

**Headers:**
- `apikey: {sua-api-key}`

**Parâmetros:**
- `instanceName` (string): Nome da instância

---

## 🔗 Rotas de Webhook

### POST /webhook/{instanceName}
Recebe eventos de webhook de uma instância específica.

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Body:** Varia conforme o tipo de evento

**Resposta:**
```json
{
  "success": true,
  "message": "Webhook processado para instância test-instance",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### GET /webhook/{instanceName}
Testa se o endpoint de webhook está funcionando.

**Parâmetros:**
- `instanceName` (string): Nome da instância

**Resposta:**
```json
{
  "message": "Webhook endpoint ativo para instância: test-instance",
  "url": "http://localhost:3333/webhook/test-instance",
  "methods": ["GET", "POST"],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 💭 Rotas de Prompt (Nova)

### POST /prompt/save
Salva um novo prompt no sistema.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "title": "Prompt de Exemplo",
  "content": "Este é o conteúdo do prompt...",
  "category": "assistente",
  "tags": ["ai", "helper"],
  "isPublic": false
}
```

**Resposta (201):**
```json
{
  "id": "prompt_1704110400000_abc123def",
  "title": "Prompt de Exemplo",
  "content": "Este é o conteúdo do prompt...",
  "category": "assistente",
  "tags": ["ai", "helper"],
  "isPublic": false,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔒 Autenticação

A maioria das rotas requer autenticação via header `apikey`:

```http
apikey: parangaricutirimicuaro-xyzzy-2233123123123213
```

---

## 📋 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autorizado
- **404**: Não encontrado
- **500**: Erro interno do servidor

---

## 🔄 Eventos SSE

O endpoint `/instances/{instanceName}/events` fornece os seguintes eventos:

### connection.update
```json
{
  "type": "connection.update",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "instance": "test-instance",
  "data": {
    "state": "open",
    "status": "✅ CONECTADO"
  }
}
```

### qrcode.updated
```json
{
  "type": "qrcode.updated",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "instance": "test-instance",
  "data": {
    "qrcode": {
      "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
}
```

### message.received
```json
{
  "type": "message.received",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "instance": "test-instance",
  "data": {
    "from": "5511999999999@s.whatsapp.net",
    "message": "Olá!",
    "timestamp": 1704110400
  }
}
```

---

## 🧪 Testando a API

Use o arquivo `api-test.http` na raiz do projeto para testar todas as rotas com o VS Code REST Client ou similar.

**Variáveis de ambiente:**
```http
@baseUrl = http://localhost:3333
@apiKey = parangaricutirimicuaro-xyzzy-2233123123123213
@contentType = application/json
```