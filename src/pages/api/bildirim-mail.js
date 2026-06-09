// src/pages/api/bildirim-mail.js
// Admin onay/reddet sonrası kullanıcıya mail gönderir

import { createClient } from '@supabase/supabase-js'
import { ilanOnaylandiMaili, ilanReddedildiMaili } from '../../lib/mail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ hata: 'Sadece POST' })
  }

  const { ilanId, tip, sebep } = req.body

  if (!ilanId || !tip) {
    return res.status(400).json({ hata: 'ilanId ve tip gerekli' })
  }

  try {
    // İlanı çek - email ve başlık için
    const { data: ilan, error } = await supabase
      .from('ilanlar')
      .select('*')
      .eq('id', ilanId)
      .single()

    if (error || !ilan) {
      return res.status(404).json({ hata: 'İlan bulunamadı' })
    }

    // Kullanıcı email'ini bul (ilanlar tablosunda email varsa direkt, yoksa kullanicilar'dan)
    let alici = ilan.kullanici_email || ilan.email
    let ad = ilan.kullanici_ad || ilan.ad || 'Değerli kullanıcı'

    if (!alici && ilan.kullanici_id) {
      const { data: kullanici } = await supabase
        .from('kullanicilar')
        .select('email, ad')
        .eq('id', ilan.kullanici_id)
        .single()
      if (kullanici) {
        alici = kullanici.email
        ad = kullanici.ad || ad
      }
    }

    if (!alici) {
      return res.status(200).json({ uyari: 'Email bulunamadı, mail gönderilmedi' })
    }

    const ilanBaslik = ilan.baslik || 'Talebiniz'
    let sonuc

    if (tip === 'onaylandi') {
      sonuc = await ilanOnaylandiMaili(alici, ad, ilanBaslik)
    } else if (tip === 'reddedildi') {
      sonuc = await ilanReddedildiMaili(alici, ad, ilanBaslik, sebep)
    } else {
      return res.status(400).json({ hata: 'Geçersiz tip' })
    }

    return res.status(200).json({ basarili: true, mail: sonuc })
  } catch (err) {
    console.error('Bildirim mail hatası:', err)
    return res.status(500).json({ hata: err.message })
  }
}
