-- ============================================
-- Setup do Supabase para Captura de Leads
-- Aquarelada Editora - Super Manual de Brincadeiras
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  form TEXT NOT NULL CHECK (form IN ('manual-access', 'publisher')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  message TEXT DEFAULT '',
  attribution JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'web-form',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted'))
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_form ON leads(form);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Criar índice GIN para atribuição (buscas em JSON)
CREATE INDEX IF NOT EXISTS idx_leads_attribution ON leads USING GIN(attribution);

-- ============================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções públicas (via API)
CREATE POLICY "Permitir inserção pública"
ON leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para permitir leituras públicas (via API)
CREATE POLICY "Permitir leitura pública"
ON leads
FOR SELECT
TO anon
USING (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para leads do Super Manual
CREATE OR REPLACE VIEW supermanual_leads AS
SELECT
  id,
  name,
  email,
  whatsapp,
  attribution,
  created_at,
  status
FROM leads
WHERE form = 'manual-access'
ORDER BY created_at DESC;

-- View para leads da Editora
CREATE OR REPLACE VIEW publisher_leads AS
SELECT
  id,
  name,
  email,
  message,
  attribution,
  created_at,
  status
FROM leads
WHERE form = 'publisher'
ORDER BY created_at DESC;

-- View para estatísticas
CREATE OR REPLACE VIEW lead_stats AS
SELECT
  form,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days,
  MIN(created_at) as first_lead,
  MAX(created_at) as last_lead
FROM leads
GROUP BY form;

-- ============================================
-- FUNCTIONS ÚTEIS
-- ============================================

-- Function para validar formato de e-mail
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar e-mail antes de inserir
CREATE OR REPLACE FUNCTION validate_lead_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'E-mail inválido: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER trigger_validate_lead_email
BEFORE INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION validate_lead_email();

-- ============================================
-- DADOS DE EXEMPLO (para teste)
-- ============================================

-- Inserir alguns leads de teste
INSERT INTO leads (id, form, name, email, whatsapp, attribution, created_at, source, status) VALUES
('test-001', 'manual-access', 'João Silva', 'joao@example.com', '+5511999999999', '{"source": "google"}', NOW(), 'web-form', 'active'),
('test-002', 'manual-access', 'Maria Santos', 'maria@example.com', '+5511888888888', '{"source": "instagram"}', NOW() - INTERVAL '1 day', 'web-form', 'active'),
('test-003', 'publisher', 'Pedro Costa', 'pedro@example.com', NULL, '{"source": "pagina-editora"}', NOW() - INTERVAL '2 days', 'web-form', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RELATÓRIOS E CONSULTAS ÚTEIS
-- ============================================

-- Comentário com consultas úteis
COMMENT ON TABLE leads IS 'Tabela principal de leads capturados pelos formulários da Aquarelada';

-- Leads por dia (últimos 30 dias)
-- SELECT DATE(created_at) as date, form, COUNT(*) as count
-- FROM leads
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY DATE(created_at), form
-- ORDER BY date DESC, form;

-- Leads por fonte de origem
-- SELECT
--   attribution->>'source' as source,
--   COUNT(*) as total
-- FROM leads
-- WHERE attribution->>'source' IS NOT NULL
-- GROUP BY attribution->>'source'
-- ORDER BY total DESC;

-- Leads por status
-- SELECT status, COUNT(*) as total
-- FROM leads
-- GROUP BY status;