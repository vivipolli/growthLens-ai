# 🔑 Configurando Conta Hedera

## Opção 1: Usar Portal Hedera (Recomendado)

### 1. Acesse o Portal Hedera
- Vá para: https://portal.hedera.com/
- Clique em "Create Account"

### 2. Configure a Conta
- **Network:** Testnet
- **Account Type:** Individual
- **Initial Balance:** 2 HBAR (gratuito)

### 3. Salve as Credenciais
Após criar a conta, você receberá:
- **Account ID** (ex: `0.0.1234567`)
- **Private Key** (ex: `302e020100300506032b657004220420...`)

### 4. Atualize o .env
```bash
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
```

## Opção 2: Usar Conta Existente

Se você já tem uma conta `0.0.5904577`, precisa da chave privada original:

### 1. Recuperar Chave Original
- Acesse o portal onde criou a conta
- Ou verifique seus arquivos de backup
- A chave deve ter formato: `302e020100300506032b657004220420...`

### 2. Atualizar .env
```bash
HEDERA_ACCOUNT_ID=0.0.5904577
HEDERA_PRIVATE_KEY=SUA_CHAVE_ORIGINAL_AQUI
HEDERA_NETWORK=testnet
```

## ⚠️ Importante

- **Nunca compartilhe sua chave privada**
- **Use apenas testnet para desenvolvimento**
- **A conta precisa ter HBAR para transações**
- **Testnet HBAR é gratuito**

## 🧪 Teste

Após configurar, teste com:
```bash
curl -X POST http://localhost:3001/api/business/profile/save \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","profileData":{"name":"Test"}}'
``` 