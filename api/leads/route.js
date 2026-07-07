// API para capturar leads dos formulários
// Esta function recebe dados dos formulários e armazena no Vercel KV

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

    // Armazenar no Upstash Redis (se configurado)
    // Caso contrário, apenas loga o lead
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        });

        // Armazenar lead individual
        await redis.set(`lead:${lead.id}`, JSON.stringify(lead));

        // Adicionar à lista de leads por formulário
        const formLeadsKey = `leads:${form}`;
        const existingLeads = await redis.get(formLeadsKey);
        const leadsList = existingLeads ? JSON.parse(existingLeads) : [];
        leadsList.push(lead.id);
        await redis.set(formLeadsKey, JSON.stringify(leadsList));

        // Adicionar à lista global de leads
        const allLeadsKey = 'leads:all';
        const allLeads = await redis.get(allLeadsKey);
        const allLeadsList = allLeads ? JSON.parse(allLeads) : [];
        allLeadsList.push(lead.id);
        await redis.set(allLeadsKey, JSON.stringify(allLeadsList));

        console.log('Lead armazenado no Upstash Redis:', lead.id);
      } catch (redisError) {
        console.error('Erro ao armazenar no Redis:', redisError);
        // Continuar mesmo se Redis falhar
      }
    } else {
      console.log('Upstash Redis não configurado. Lead recebido (não armazenado):', lead);
    }

    // Log para debug
    console.log('Novo lead recebido:', {
      id: lead.id,
      form: lead.form,
      name: lead.name,
      email: lead.email,
      timestamp: lead.createdAt
    });

    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        message: 'Lead capturado com sucesso'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar lead' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Método GET para listar leads (opcional, para dashboard)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const form = searchParams.get('form');

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return new Response(
        JSON.stringify({
          error: 'Upstash Redis não configurado',
          leads: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    const leadsKey = form ? `leads:${form}` : 'leads:all';
    const leadsIds = await redis.get(leadsKey);
    const leadsList = leadsIds ? JSON.parse(leadsIds) : [];

    // Buscar detalhes de cada lead
    const leads = await Promise.all(
      leadsList.map(async (id) => {
        const leadData = await redis.get(`lead:${id}`);
        return leadData ? JSON.parse(leadData) : null;
      })
    );

    return new Response(
      JSON.stringify({
        leads: leads.filter(Boolean),
        total: leads.filter(Boolean).length
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