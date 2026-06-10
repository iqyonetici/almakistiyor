// src/pages/api/ilan-suresi-kontrol.js
// Vercel Cron tarafindan gunde 1 kez cagrilir.
// Suresi dolan aktif ilanlari pasife alir ve sahibine mail gonderir.

import { createClient } from '@supabase/supabase-js'
import { ilanSuresiDolduMaili } from '../../lib/mail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Guvenlik: CRON_SECRET tanimliysa kontrol et (Vercel cron otomatik gonderir)
  if (process.env.CRON_SECRET) {
    const auth = req.headers.authorization
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ hata: 'Yetkisiz' })
    }
  }

  try {
    const simdi = new Date().toISOString()

    // Suresi dolmus aktif ilanlari bul
    const { data: dolanlar, error } = await supabase
      .from('ilanlar')
      .select('id, kullanici_email, kullanici_ad, baslik, kategori, sehir, ilce, emlak_tip, markalar')
      .eq('durum', 'aktif')
      .not('bitis_tarihi', 'is', null)
      .lt('bitis_tarihi', simdi)

    if (error) {
      console.error('Sorgu hatasi:', error)
      return res.status(500).json({ hata: error.message })
    }

    if (!dolanlar || dolanlar.length === 0) {
      return res.status(200).json({ basarili: true, islenen: 0 })
    }

    let islenen = 0
    for (const ilan of dolanlar) {
      // Pasife al
      const { error: updErr } = await supabase
        .from('ilanlar')
        .update({ durum: 'pasif' })
        .eq('id', ilan.id)

      if (updErr) { console.error('Pasife alma hatasi:', ilan.id, updErr); continue }
      islenen++

      // Mail gonder (hata olsa devam et)
      if (ilan.kullanici_email && ilan.kullanici_email.includes('@')) {
        let ilanBaslik = ilan.baslik
        if (!ilanBaslik) {
          const yer = ilan.ilce || ilan.sehir || ''
          if (ilan.kategori === 'emlak') ilanBaslik = `${yer} ${ilan.emlak_tip || 'Emlak'} talebi`.trim()
          else if (ilan.kategori === 'vasita') ilanBaslik = `${ilan.markalar || 'Arac'} talebi`
          else ilanBaslik = yer ? `${yer} ${ilan.kategori} talebi` : 'Talebiniz'
        }
        try {
          await ilanSuresiDolduMaili(ilan.kullanici_email, ilan.kullanici_ad || 'Değerli kullanıcı', ilanBaslik)
        } catch (mailErr) {
          console.error('Sure maili hatasi:', ilan.id, mailErr)
        }
      }
    }

    return res.status(200).json({ basarili: true, islenen, toplam: dolanlar.length })
  } catch (err) {
    console.error('Cron hatasi:', err)
    return res.status(500).json({ hata: err.message })
  }
}
