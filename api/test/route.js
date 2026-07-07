// API de teste simples
export async function GET() {
  return new Response(JSON.stringify({ message: 'API funcionando!', timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      message: 'POST funcionando!',
      received: body,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}