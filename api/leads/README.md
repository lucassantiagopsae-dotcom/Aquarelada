# Sistema de Captura de Leads - Aquarelada Editora

## 🎯 **Objetivo**

Sistema completo para capturar e armazenar leads dos formulários do Super Manual de Brincadeiras e da Editora.

## 📊 **Estrutura de Dados**

### **Leads do Super Manual (`manual-access`)**
- `name` - Nome completo
- `email` - E-mail
- `whatsapp` - WhatsApp
- `attribution` - Dados de atribuição (origem, campanha, etc)

### **Leads da Editora (`publisher`)**
- `name` - Nome completo  
- `email` - E-mail
- `message` - Mensagem
- `attribution` - Dados de atribuição

## 🔧 **Configuração do Banco de Dados**

### **Opção 1: Vercel KV (Recomendado)**

```bash
# Instalar KV via Vercel CLI
vercel install vercel-kv

# Ou via dashboard:
# 1. Acesse seu projeto no Vercel
# 2. Vá em "Storage" → "Create Database"
# 3. Escolha "Vercel KV" e crie o banco
```

### **Opção 2: Supabase (Alternativa Gratuita)**

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um projeto novo
3. Execute o SQL abaixo:

```sql
-- Criar tabela de leads
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  form TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  message TEXT,
  attribution JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'web-form',
  status TEXT DEFAULT 'active'
);

-- Criar índices
CREATE INDEX idx_leads_form ON leads(form);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created ON leads(created_at);
```

### **Opção 3: Planetscale (MySQL)**

```bash
vercel install planetscale
```

## 🚀 **Instalação**

### **1. Instalar dependências**

```bash
npm install
```

### **2. Configurar variáveis de ambiente**

**Para Vercel KV:**
```bash
vercel env pull KV_REST_API_URL
vercel env pull KV_REST_API_TOKEN
```

**Para Supabase:**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

### **3. Fazer deploy**

```bash
vercel --prod
```

## 📝 **Uso**

### **Capturar Lead (POST)**

```javascript
// Exemplo de envio
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    form: 'manual-access',
    name: 'João Silva',
    email: 'joao@example.com',
    whatsapp: '+5511999999999',
    attribution: {
      source: 'google',
      campaign: 'manual-brincadeiras'
    }
  })
});
```

### **Listar Leads (GET)**

```bash
# Listar todos os leads
curl https://seu-dominio.com/api/leads

# Listar leads de um formulário específico
curl https://seu-dominio.com/api/leads?form=manual-access
```

## 🔍 **Monitoramento**

### **Ver leads capturados**

Acesse: `https://seu-dominio.com/api/leads?form=manual-access`

### **Logs no Vercel**

```bash
vercel logs --follow
```

## 📄 **Formulários Configurados**

### **1. Super Manual de Brincadeiras**
- **Endpoint:** `/api/leads`
- **Form ID:** `manual-access`
- **Campos:** name, email, whatsapp

### **2. Aquarelada Editora**
- **Endpoint:** `/api/leads`  
- **Form ID:** `publisher`
- **Campos:** name, email, message

## 🛡️ **Segurança**

- Validação de campos obrigatórios
- Sanitização de dados
- Proteção contra injeção de SQL
- Rate limiting (configurável via Vercel)

## 📊 **Exportação de Dados**

### **Exportar para CSV**

```bash
curl https://seu-dominio.com/api/leads | jq -r '.leads[] | [.name, .email, .whatsapp, .form, .createdAt] | @csv' > leads.csv
```

### **Exportar para JSON**

```bash
curl https://seu-dominio.com/api/leads > leads.json
```

## 🔄 **Integrações**

### **Google Sheets**

Crie um Google Apps Script para importar leads automaticamente:

```javascript
function importLeads() {
  const response = UrlFetchApp.fetch('https://seu-dominio.com/api/leads');
  const leads = JSON.parse(response.getContentText()).leads;
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  leads.forEach(lead => {
    sheet.appendRow([lead.name, lead.email, lead.whatsapp, lead.form, lead.createdAt]);
  });
}
```

## 📞 **Suporte**

Para dúvidas ou problemas, verifique:
1. Logs do Vercel: `vercel logs --follow`
2. Variáveis de ambiente: `vercel env ls`
3. Status do banco: Vercel Dashboard → Storage