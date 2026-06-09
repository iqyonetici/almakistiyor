// src/pages/api/hosgeldin-mail.js
// Kayıt sonrası hoş geldin maili gönderir

import { hosgeldinMaili } from '../../lib/mail'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ hata: 'Sadece POST' })
  }

  const { email, ad } = req.body

  if (!email) {
    return res.status(400).json({ hata: 'Email gerekli' })
  }

  try {
    const sonuc = await hosgeldinMaili(email, ad || 'Değerli kullanıcı')
    return res.status(200).json({ basarili: true, mail: sonuc })
  } catch (err) {
    console.error('Hoşgeldin mail hatası:', err)
    return res.status(500).json({ hata: err.message })
  }
}
