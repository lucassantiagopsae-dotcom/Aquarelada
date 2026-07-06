#!/bin/bash

# Script para fazer deploy do sistema de leads
# Aquarelada Editora - Super Manual de Brincadeiras

echo "🚀 Preparando deploy do sistema de leads..."

# Passo 1: Adicionar arquivos
echo "📁 Adicionando arquivos ao git..."
git add api/
git add package.json
git add SETUP-LEADS.md
git add api/leads/README.md
git add supabase-setup.sql

# Passo 2: Commit
echo "💾 Criando commit..."
git commit -m "feat: adicionar sistema completo de captura de leads

- Criar API endpoints para captura de leads (/api/leads)
- Suportar múltiplos backends (Vercel KV, Supabase, Planetscale)
- Configurar formulários do Super Manual e Editora
- Adicionar documentação completa de setup
- Incluir scripts SQL para Supabase
- Criar sistema de validação e armazenamento

Formulários configurados:
- Super Manual: name, email, whatsapp + attribution
- Editora: name, email, message + attribution

Storage options:
- Vercel KV (recomendado para simplicidade)
- Supabase (recomendado para recursos gratuitos)
- Planetscale (alternativa MySQL)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Passo 3: Push
echo "📤 Fazendo push para o GitHub..."
git push origin master

# Passo 4: Deploy no Vercel
echo "🌐 Fazendo deploy no Vercel..."
vercel --prod

echo "✅ Sistema de leads deployado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configurar banco de dados (veja SETUP-LEADS.md)"
echo "2. Testar captura de leads"
echo "3. Verificar dados no dashboard"
echo ""
echo "🔗 Links úteis:"
echo "- API: https://aquarelada.vercel.app/api/leads"
echo "- Setup: veja arquivo SETUP-LEADS.md"
echo "- Logs: vercel logs --follow"