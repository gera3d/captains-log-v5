import { serve } from 'std/server';
import { createClient } from 'npm:@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await adminClient.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data, error } = await adminClient
      .from('hubs')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('get-my-hubs error', err);
    return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
  }
});