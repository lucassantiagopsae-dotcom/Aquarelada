# 🎯 Sistema de Captura de Leads - Setup Completo

## 📋 **Status Atual**

✅ **Sistema pronto para uso!**

Os formulários já estão configurados para enviar dados para a nova API `/api/leads`. Você só precisa configurar o banco de dados.

## 🚀 **Setup Rápido (5 minutos)**

### **Opção 1: Supabase (Recomendado - GRATUITO)**

**1. Criar conta no Supabase:**
- Acesse [supabase.com](https://supabase.com)
- Clique em "Start your project"
- Use GitHub para login

**2. Criar projeto:**
- Nome: `aquarelada-leads`
- Senha: escolha uma segura
- Região: São Paulo (ou mais próxima)

**3. Configurar banco de dados:**
- No dashboard do Supabase, vá em "SQL Editor"
- Cole o conteúdo do arquivo `supabase-setup.sql`
- Execute o SQL

**4. Configurar no Vercel:**
```bash
# Pegar as credenciais do Supabase Dashboard
# Settings → API → Project URL + anon key

vercel env add SUPABASE_URL
# Cole: https://seu-projeto.supabase.co

vercel env add SUPABASE_KEY
# Cole: sua-chave-anon-publica
```

**5. Deploy:**
```bash
vercel --prod
```

### **Opção 2: Vercel KV (Simples)**

**1. Instalar KV:**
```bash
vercel install vercel-kv
```

**2. Deploy:**
```bash
vercel --prod
```

### **Opção 3: Planetscale (MySQL)**

**1. Criar conta:**
- Acesse [planetscale.com](https://planetscale.com)
- Crie um database

**2. Instalar integração:**
```bash
vercel install planetscale
```

**3. Deploy:**
```bash
vercel --prod
```

## 📊 **Formulários Configurados**

### **1. Super Manual de Brincadeiras**
- **Formulário:** Captura na página `/supermanual/`
- **Dados capturados:**
  - ✅ Nome completo
  - ✅ E-mail
  - ✅ WhatsApp
  - ✅ Atribuição (origem, campanha, etc)

### **2. Aquarelada Editora**
- **Formulário:** Captura na página principal `/`
- **Dados capturados:**
  - ✅ Nome completo
  - ✅ E-mail
  - ✅ Mensagem
  - ✅ Atribuição

## 🧪 **Testes**

### **Testar Captura de Lead**

**1. Teste manual:**
```bash
curl -X POST https://seu-dominio.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "form": "manual-access",
    "name": "João Teste",
    "email": "teste@example.com",
    "whatsapp": "+5511999999999",
    "attribution": {
      "source": "test",
      "campaign": "setup"
    }
  }'
```

**2. Teste via navegador:**
- Acesse: `https://seu-dominio.com/supermanual/`
- Preencha o formulário
- Verifique os logs: `vercel logs --follow`

**3. Verificar dados armazenados:**
```bash
curl https://seu-dominio.com/api/leads | jq
```

## 📈 **Dashboard e Análise**

### **Via Supabase:**
- Acesse: `https://supabase.com/dashboard`
- Vá em: "Table Editor" → "leads"
- Use os filtros para analisar dados

### **Via API:**
```bash
# Leads do Super Manual
curl "https://seu-dominio.com/api/leads?form=manual-access"

# Leads da Editora
curl "https://seu-dominio.com/api/leads?form=publisher"

# Todos os leads
curl "https://seu-dominio.com/api/leads"
```

### **Exportar para CSV/Excel:**
```bash
# Exportar todos os leads
curl "https://seu-dominio.com/api/leads" | \
  jq -r '.leads[] | [.name, .email, .whatsapp, .form, .createdAt] | @csv' \
  > leads.csv

# Exportar apenas do Super Manual
curl "https://seu-dominio.com/api/leads?form=manual-access" | \
  jq -r '.leads[] | [.name, .email, .whatsapp, .createdAt] | @csv' \
  > supermanual-leads.csv
```

## 🔔 **Integrações**

### **Google Sheets:**

Crie uma planilha e adicione este Apps Script:

```javascript
function importLeads() {
  var response = UrlFetchApp.fetch('https://seu-dominio.com/api/leads');
  var leads = JSON.parse(response.getContentText()).leads;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear();
  sheet.appendRow(['Nome', 'Email', 'WhatsApp', 'Formulário', 'Data']);
  
  leads.forEach(function(lead) {
    sheet.appendRow([
      lead.name,
      lead.email,
      lead.whatsapp,
      lead.form,
      new Date(lead.createdAt)
    ]);
  });
}

// Criar trigger automático (executar a cada hora)
function createTrigger() {
  ScriptApp.newTrigger('importLeads')
    .timeBased()
    .everyHours(1)
    .create();
}
```

### **Notificações no Slack/WhatsApp:**

Adicione ao `api/leads/route.js`:

```javascript
// Após armazenar lead com sucesso
if (storageSuccess) {
  // Enviar para Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🎉 Novo lead: ${lead.name} (${lead.form})`
      })
    });
  }
}
```

## 🔒 **Segurança**

### **Proteções implementadas:**
- ✅ Validação de campos obrigatórios
- ✅ Sanitização de dados
- ✅ Proteção contra SQL injection
- ✅ Rate limiting (via Vercel)
- ✅ CORS configurado
- ✅ RLS no Supabase

### **Variáveis de ambiente:**
```bash
# Listar variáveis configuradas
vercel env ls

# Adicionar nova variável
vercel env add NOME_DA_VARIAVEL

# Remover variável
vercel env rm NOME_DA_VARIAVEL
```

## 📝 **Troubleshooting**

### **Leads não aparecem:**
1. Verificar logs: `vercel logs --follow`
2. Testar API manualmente (veja acima)
3. Verificar variáveis de ambiente: `vercel env ls`

### **Erro no Supabase:**
1. Verificar se o SQL foi executado
2. Confirmar que as variáveis estão corretas
3. Checar o dashboard do Supabase

### **Erro no Vercel KV:**
1. Verificar se a integração foi instalada
2. Confirmar variáveis de ambiente
3. Checar logs do Vercel

## 🚀 **Próximos Passos**

Após o setup funcionando:

1. **Testar formulários no site**
2. **Verificar dados no dashboard**
3. **Configurar integrações (Google Sheets, Slack)**
4. **Monitorar via logs**: `vercel logs --follow`
5. **Exportar dados regularmente**

## 📞 **Suporte**

Para dúvidas:
- Ver logs: `vercel logs --follow`
- Ver dashboard: [vercel.com](https://vercel.com)
- Ver Supabase: [supabase.com](https://supabase.com)

---

**Status do sistema:** ✅ **PRONTO PARA USO**