// src/pages/api/mesaj-mail.js
// Yeni mesaj gönderildiğinde alıcıya bildirim maili

import { ilanOlusturulduMaili, yeniMesajMaili } from '../../lib/mail'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ hata: 'Sadece POST' })
  }

  const { aliciEmail, aliciAd, gonderenAd, ilanBaslik, mesajMetni } = req.body

  if (!aliciEmail) {
    return res.status(200).json({ uyari: 'Alıcı email yok, mail gönderilmedi' })
  }

  try {
    const onizleme = (mesajMetni || '').slice(0, 120) + ((mesajMetni || '').length > 120 ? '...' : '')
    const sonuc = await yeniMesajMaili(
      aliciEmail,
      aliciAd || 'Değerli kullanıcı',
      gonderenAd || 'Bir kullanıcı',
      ilanBaslik || 'Talebiniz',
      onizleme
    )
    return res.status(200).json({ basarili: true, mail: sonuc })
  } catch (err) {
    console.error('Mesaj mail hatası:', err)
    return res.status(500).json({ hata: err.message })
  }
}
