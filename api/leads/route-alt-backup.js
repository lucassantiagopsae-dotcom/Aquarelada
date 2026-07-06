// API para capturar leads dos formulários - Versão com múltiplos backends
// Suporta: Vercel KV, Supabase, Planetscale

export async function POST(request) {
  try {
    const body = await request.json();
    const { form, name, email, whatsapp, message, attribution } = body;

    // Validar dados obrigatórios
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Nome e e-mail são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Criar objeto do lead
    const lead = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      form: form || 'unknown',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp?.trim() || '',
      message: message?.trim() || '',
      attribution: attribution || {},
      createdAt: new Date().toISOString(),
      source: 'web-form',
      status: 'active'
    };

    // Tentar armazenar em diferentes backends
    let storageSuccess = false;
    let storageMethod = 'none';

    // 1. Tentar Vercel KV
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { Storage } = await import('@vercel/kv');
        const kv = new Storage({
          restApiUrl: process.env.KV_REST_API_URL,
          restApiToken: process.env.KV_REST_API_TOKEN,
        });

        await kv.put(`lead:${lead.id}`, JSON.stringify(lead));

        const formLeadsKey = `leads:${form}`;
        const existingLeads = await kv.get(formLeadsKey) || '[]';
        const leadsList = JSON.parse(existingLeads);
        leadsList.push(lead.id);
        await kv.put(formLeadsKey, JSON.stringify(leadsList));

        storageMethod = 'vercel-kv';
        storageSuccess = true;
        console.log('✅ Lead armazenado no Vercel KV:', lead.id);
      } catch (kvError) {
        console.warn('❌ Erro no KV:', kvError.message);
      }
    }

    // 2. Tentar Supabase
    if (!storageSuccess && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY
        );

        const { data, error } = await supabase
          .from('leads')
          .insert([lead])
          .select();

        if (error) throw error;

        storageMethod = 'supabase';
        storageSuccess = true;
        console.log('✅ Lead armazenado no Supabase:', lead.id);
      } catch (supabaseError) {
        console.warn('❌ Erro no Supabase:', supabaseError.message);
      }
    }

    // 3. Tentar Planetscale
    if (!storageSuccess && process.env.DATABASE_URL) {
      try {
        const { Client } = await import('@planetscale/database');
        const client = new Client({ url: process.env.DATABASE_URL });

        await client.execute(
          'INSERT INTO leads (id, form, name, email, whatsapp, message, attribution, created_at, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [lead.id, lead.form, lead.name, lead.email, lead.whatsapp, lead.message, JSON.stringify(lead.attribution), lead.createdAt, lead.source, lead.status]
        );

        storageMethod = 'planetscale';
        storageSuccess = true;
        console.log('✅ Lead armazenado no Planetscale:', lead.id);
      } catch (planetscaleError) {
        console.warn('❌ Erro no Planetscale:', planetscaleError.message);
      }
    }

    // Log do lead recebido
    console.log('📝 Novo lead:', {
      id: lead.id,
      form: lead.form,
      name: lead.name,
      email: lead.email,
      storage: storageMethod,
      stored: storageSuccess
    });

    // Retornar resposta
    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        message: 'Lead capturado com sucesso',
        storage: storageMethod,
        stored: storageSuccess
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro ao processar lead:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar lead' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET para listar leads
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const form = searchParams.get('form');

    let leads = [];
    let storageMethod = 'none';

    // Tentar buscar de diferentes backends
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { Storage } = await import('@vercel/kv');
        const kv = new Storage({
          restApiUrl: process.env.KV_REST_API_URL,
          restApiToken: process.env.KV_REST_API_TOKEN,
        });

        const leadsKey = form ? `leads:${form}` : 'leads:all';
        const leadsIds = await kv.get(leadsKey) || '[]';
        const leadsList = JSON.parse(leadsIds);

        leads = await Promise.all(
          leadsList.map(async (id) => {
            const leadData = await kv.get(`lead:${id}`);
            return leadData ? JSON.parse(leadData) : null;
          })
        );

        leads = leads.filter(Boolean);
        storageMethod = 'vercel-kv';
      } catch (kvError) {
        console.warn('Erro ao buscar do KV:', kvError.message);
      }
    }

    if (leads.length === 0 && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY
        );

        let query = supabase.from('leads').select('*');
        if (form) query = query.eq('form', form);

        const { data, error } = await query;
        if (!error && data) {
          leads = data;
          storageMethod = 'supabase';
        }
      } catch (supabaseError) {
        console.warn('Erro ao buscar do Supabase:', supabaseError.message);
      }
    }

    return new Response(
      JSON.stringify({
        leads,
        total: leads.length,
        storage: storageMethod
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao listar leads:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao listar leads' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}