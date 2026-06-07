import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { ilan_id } = await request.json();

    if (!ilan_id) {
      return NextResponse.json({ error: 'ilan_id gerekli' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { basarili: false, neden: 'giris_gerekli', mesaj: 'Telefonu gormek icin giris yapmalisiniz.' },
        { status: 401 }
      );
    }

    // session.user.id = supabase_id
    const { data, error } = await supabase.rpc('telefonu_goruntule', {
      p_supabase_id: session.user.id,
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

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ sinÄ±rsÄ±z: false, toplam: 0, kullanilan: 0, kalan: 0 });
    }

    const { data, error } = await supabase.rpc('kalan_telefon_hakki', {
      p_supabase_id: session.user.id,
    });

    if (error) {
      return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
  }
}
