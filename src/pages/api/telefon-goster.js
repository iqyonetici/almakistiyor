// src/pages/api/telefon-goster.js

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ hata: 'Sadece POST' })

  const { ilan_id, kullanici_email, sadece_kontrol } = req.body

  if (!ilan_id || !kullanici_email) {
    return res.status(400).json({ hata: 'Eksik parametre' })
  }

  // sadece_kontrol=true ise: hak düşürmeden sadece daha önce gördü mü bak
  if (sadece_kontrol) {
    const { data: gordu } = await supabase
      .from('telefon_goruntulemeler')
      .select('ilan_id')
      .eq('kullanici_email', kullanici_email)
      .eq('ilan_id', ilan_id)
      .limit(1)
      .single()

    if (!gordu) return res.status(200).json({ izin: false })

    // Daha önce görmüş — telefonu getir
    const { data: ilan } = await supabase
      .from('ilanlar')
      .select('kullanici_telefon')
      .eq('id', ilan_id)
      .single()

    // Bugünkü kalan hakkı hesapla
    const { data: kullanici } = await supabase
      .from('kullanicilar')
      .select('paket')
      .eq('email', kullanici_email)
      .single()

    const { data: paket } = await supabase
      .from('paketler')
      .select('gunluk_telefon')
      .eq('kod', kullanici?.paket || 'ucretsiz')
      .single()

    const bugun = new Date().toISOString().slice(0, 10)
    const { count } = await supabase
      .from('telefon_goruntulemeler')
      .select('*', { count: 'exact', head: true })
      .eq('kullanici_email', kullanici_email)
      .eq('tarih', bugun)

    return res.status(200).json({
      izin: true,
      zaten_goruldu: true,
      telefon: ilan?.kullanici_telefon,
      kalan_hak: Math.max(0, (paket?.gunluk_telefon || 0) - (count || 0)),
    })
  }

  // Normal akış — check_telefon_hakki fonksiyonunu çağır
  const { data, error } = await supabase.rpc('check_telefon_hakki', {
    p_kullanici_email: kullanici_email,
    p_ilan_id: ilan_id,
  })

  if (error) {
    console.error('RPC hata:', error)
    return res.status(500).json({ hata: 'Sunucu hatası' })
  }

  return res.status(200).json(data)
}
