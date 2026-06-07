import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabase(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || '',
        },
      },
    }
  );
  return supabase;
}

export async function POST(request) {
  try {
    const { ilan_id } = await request.json();
    if (!ilan_id) {
      return NextResponse.json({ error: 'ilan_id gerekli' }, { status: 400 });
    }

    const supabase = getSupabase(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { basarili: false, neden: 'giris_gerekli', mesaj: 'Telefonu gormek icin giris yapmalisiniz.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc('telefonu_goruntule', {
      p_supabase_id: user.id,
      p_ilan_id: ilan_id,
    });

    if (error) {
      console.error('Telefon goruntuleme hatasi:', error);
      return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API hatasi:', err);
    return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = getSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ sinirsiz: false, toplam: 0, kullanilan: 0, kalan: 0 });
    }

    const { data, error } = await supabase.rpc('kalan_telefon_hakki', {
      p_supabase_id: user.id,
    });

    if (error) {
      return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
  }
}
