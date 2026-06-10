// src/pages/api/ilan-uzat.js
// Ilani aktife alir ve bitis tarihini bugunden +30 gun yapar.
// Pasife alma da buradan yapilir (bitis tarihine dokunmaz).
// Kural: aktife alindigi andan itibaren her zaman tam 30 gun — birikme yok.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ hata: 'Sadece POST' })
  }

  const { ilanId, email, islem } = req.body
  // islem: 'aktif' (aktife al + 30 gun) veya 'pasif' (sadece pasife al)

  if (!ilanId || !email || !islem) {
    return res.status(400).json({ hata: 'ilanId, email ve islem gerekli' })
  }

  try {
    // Sahiplik kontrolu
    const { data: ilan, error } = await supabase
      .from('ilanlar')
      .select('id, kullanici_email, onay_durumu')
      .eq('id', ilanId)
      .single()

    if (error || !ilan) {
      return res.status(404).json({ hata: 'İlan bulunamadı' })
    }
    if (ilan.kullanici_email !== email) {
      return res.status(403).json({ hata: 'Bu ilan size ait değil' })
    }

    if (islem === 'aktif') {
      // Onaylanmamis ilan aktife alinamaz
      if (ilan.onay_durumu !== 'onaylandi') {
        return res.status(400).json({ hata: 'İlan henüz onaylanmamış' })
      }
      // Bugunden tam 30 gun — limit otomatik korunur, birikme olmaz
      const yeniBitis = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const { error: updErr } = await supabase
        .from('ilanlar')
        .update({ durum: 'aktif', bitis_tarihi: yeniBitis })
        .eq('id', ilanId)
      if (updErr) return res.status(500).json({ hata: updErr.message })
      return res.status(200).json({ basarili: true, durum: 'aktif', bitisTarihi: yeniBitis })
    }

    if (islem === 'pasif') {
      const { error: updErr } = await supabase
        .from('ilanlar')
        .update({ durum: 'pasif' })
        .eq('id', ilanId)
      if (updErr) return res.status(500).json({ hata: updErr.message })
      return res.status(200).json({ basarili: true, durum: 'pasif' })
    }

    return res.status(400).json({ hata: 'Geçersiz işlem' })
  } catch (err) {
    console.error('İlan uzat hatası:', err)
    return res.status(500).json({ hata: err.message })
  }
}
