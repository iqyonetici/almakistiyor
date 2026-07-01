// src/pages/api/cron/pro-kontrol.js
// Vercel Cron tarafından günde 1 kez çağrılır.
// - paket_bitis'i geçmiş kullanıcıları otomatik "ucretsiz" pakete düşürür + bilgi maili atar
// - paket_bitis'ine tam 3 gün kalan kullanıcılara uyarı maili atar
import { createClient } from '@supabase/supabase-js'
import { proSuresiDolmakUzereMaili, proSuresiDolduMaili } from '../../../lib/mail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Vercel Cron isteklerini doğrula — CRON_SECRET .env'de tanımlı olmalı
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ hata: 'Yetkisiz' })
  }

  try {
    const simdi = new Date()
    const ucGunSonra = new Date(simdi.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Pro pakette olan (paket_bitis dolu, "ucretsiz" olmayan) tüm kullanıcıları çek
    const { data: kullanicilar, error } = await supabase
      .from('kullanicilar')
      .select('id, email, ad, paket, paket_bitis')
      .neq('paket', 'ucretsiz')
      .not('paket_bitis', 'is', null)

    if (error) throw error

    // Ücretsiz paketin varsayılan hak bilgilerini çek (düşürme sırasında kullanılacak)
    const { data: ucretsizPaket } = await supabase
      .from('paketler').select('gunluk_ilan, gunluk_mesaj').eq('kod', 'ucretsiz').single()
    const gunlukIlanUcretsiz = ucretsizPaket?.gunluk_ilan ?? 3
    const gunlukMesajUcretsiz = ucretsizPaket?.gunluk_mesaj ?? 1

    let dusurulen = 0
    let uyariAtilan = 0

    for (const k of kullanicilar || []) {
      const bitis = new Date(k.paket_bitis)

      if (bitis < simdi) {
        // Süresi dolmuş — ücretsize düşür + bilgi maili
        await supabase.from('kullanicilar').update({
          paket: 'ucretsiz',
          gunluk_ilan_hakki: gunlukIlanUcretsiz,
          gunluk_mesaj_hakki: gunlukMesajUcretsiz,
          paket_bitis: null,
        }).eq('id', k.id)

        if (k.email) {
          await proSuresiDolduMaili(k.email, k.ad || 'Değerli kullanıcı', k.paket)
        }
        dusurulen++
      } else if (bitis <= ucGunSonra) {
        // Tam olarak 3 gün veya daha az kalmış, henüz dolmamış — sadece bugünkü
        // gün diliminde bir kere uyarı gönder (gün farkı 2-3 arasındaysa)
        const kalanGun = Math.ceil((bitis - simdi) / (24 * 60 * 60 * 1000))
        if (kalanGun === 3 && k.email) {
          await proSuresiDolmakUzereMaili(k.email, k.ad || 'Değerli kullanıcı', k.paket, k.paket_bitis)
          uyariAtilan++
        }
      }
    }

    return res.status(200).json({ basarili: true, kontrolEdilen: kullanicilar?.length || 0, dusurulen, uyariAtilan })
  } catch (err) {
    console.error('Pro kontrol cron hatası:', err)
    return res.status(500).json({ hata: err.message })
  }
}
