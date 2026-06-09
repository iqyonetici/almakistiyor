// src/lib/mail.js
// Resend ile e-posta bildirimleri

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Test modunda gÃ¶nderen adresi (domain verify olunca degistir)
const GONDEREN = 'AlmakIstiyor <noreply@almakistiyor.net>'
const SITE_URL = 'https://almakistiyor.com'

// Ortak HTML ÅŸablon sarmalayÄ±cÄ±
function sablon(baslik, icerik, butonMetin, butonLink) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px">
    <div style="background:#085041;border-radius:12px 12px 0 0;padding:24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:22px">almakistiyor.com</h1>
    </div>
    <div style="background:white;padding:32px 24px;border-radius:0 0 12px 12px">
      <h2 style="color:#0f172a;font-size:18px;margin:0 0 16px">${baslik}</h2>
      <div style="color:#374151;font-size:14px;line-height:1.7">${icerik}</div>
      ${butonMetin ? `
        <div style="text-align:center;margin:24px 0 8px">
          <a href="${butonLink}" style="display:inline-block;background:#0D7A6B;color:white;text-decoration:none;padding:12px 28px;border-radius:9px;font-size:14px;font-weight:600">${butonMetin}</a>
        </div>
      ` : ''}
    </div>
    <div style="text-align:center;padding:16px;color:#94a3b8;font-size:12px">
      Bu e-posta almakistiyor.com tarafÄ±ndan gÃ¶nderildi.<br>
      Talebinizle ilgili bildirimler iÃ§in bu adresi kullanÄ±yoruz.
    </div>
  </div>
  `
}

// Genel gÃ¶nderim fonksiyonu
async function gonder(alici, konu, html) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY yok, mail gÃ¶nderilemedi')
    return { hata: 'API key yok' }
  }
  try {
    const { data, error } = await resend.emails.send({
      from: GONDEREN,
      to: alici,
      subject: konu,
      html,
    })
    if (error) {
      console.error('Mail hatasÄ±:', error)
      return { hata: error.message }
    }
    return { basarili: true, id: data?.id }
  } catch (err) {
    console.error('Mail gÃ¶nderim hatasÄ±:', err)
    return { hata: err.message }
  }
}

// 1. Ä°lan oluÅŸturuldu (onay bekliyor)
export async function ilanOlusturulduMaili(alici, ad, ilanBaslik) {
  const icerik = `
    Merhaba ${ad},<br><br>
    <strong>"${ilanBaslik}"</strong> baÅŸlÄ±klÄ± talebiniz baÅŸarÄ±yla alÄ±ndÄ± ve onay sÃ¼recine girdi.<br><br>
    YÃ¶neticilerimiz talebinizi inceledikten sonra yayÄ±na alÄ±nacak. Genellikle birkaÃ§ saat iÃ§inde onaylanÄ±r.
    OnaylandÄ±ÄŸÄ±nda size tekrar bilgi vereceÄŸiz.
  `
  return gonder(alici, 'Talebiniz alÄ±ndÄ± ğŸ“¨', sablon('Talebiniz onay sÃ¼recinde', icerik, 'Talebimi GÃ¶rÃ¼ntÃ¼le', `${SITE_URL}/panel`))
}

// 2. Ä°lan onaylandÄ± (yayÄ±nda)
export async function ilanOnaylandiMaili(alici, ad, ilanBaslik) {
  const icerik = `
    Merhaba ${ad},<br><br>
    Harika haber! <strong>"${ilanBaslik}"</strong> baÅŸlÄ±klÄ± talebiniz onaylandÄ± ve artÄ±k yayÄ±nda. ğŸ‰<br><br>
    SatÄ±cÄ±lar talebinizi gÃ¶rebilir ve size teklif gÃ¶nderebilir. Gelen teklifleri kaÃ§Ä±rmamak iÃ§in
    e-postanÄ±zÄ± ve hesabÄ±nÄ±zÄ± dÃ¼zenli kontrol edin.
  `
  return gonder(alici, 'Talebiniz yayÄ±nda! ğŸ‰', sablon('Talebiniz onaylandÄ±', icerik, 'Talebimi GÃ¶rÃ¼ntÃ¼le', `${SITE_URL}/panel`))
}

// 3. Ä°lan reddedildi
export async function ilanReddedildiMaili(alici, ad, ilanBaslik, sebep) {
  const icerik = `
    Merhaba ${ad},<br><br>
    <strong>"${ilanBaslik}"</strong> baÅŸlÄ±klÄ± talebiniz maalesef onaylanamadÄ±.<br><br>
    ${sebep ? `<strong>Sebep:</strong> ${sebep}<br><br>` : ''}
    Talebinizi dÃ¼zenleyip tekrar gÃ¶nderebilirsiniz. SorularÄ±nÄ±z iÃ§in destek ekibimize ulaÅŸabilirsiniz.
  `
  return gonder(alici, 'Talebiniz hakkÄ±nda', sablon('Talebiniz onaylanamadÄ±', icerik, 'Yeni Talep OluÅŸtur', `${SITE_URL}`))
}

// 4. Yeni mesaj geldi
export async function yeniMesajMaili(alici, ad, gonderenAd, ilanBaslik, mesajOnizleme) {
  const icerik = `
    Merhaba ${ad},<br><br>
    <strong>${gonderenAd}</strong> size <strong>"${ilanBaslik}"</strong> talebiniz hakkÄ±nda mesaj gÃ¶nderdi:<br><br>
    <div style="background:#f1f5f9;border-left:3px solid #0D7A6B;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;color:#475569">
      "${mesajOnizleme}"
    </div><br>
    YanÄ±tlamak iÃ§in mesajlarÄ±nÄ±za gidin.
  `
  return gonder(alici, `${gonderenAd} size mesaj gÃ¶nderdi ğŸ’¬`, sablon('Yeni mesajÄ±nÄ±z var', icerik, 'MesajÄ± GÃ¶rÃ¼ntÃ¼le', `${SITE_URL}/panel`))
}

// 5. HoÅŸ geldin (kayÄ±t sonrasÄ±)
export async function hosgeldinMaili(alici, ad) {
  const icerik = `
    Merhaba ${ad},<br><br>
    almakistiyor.com'a hoÅŸ geldiniz! HesabÄ±nÄ±z baÅŸarÄ±yla oluÅŸturuldu.<br><br>
    ArtÄ±k talep oluÅŸturabilir, satÄ±cÄ±lardan teklif alabilir ve onlarla mesajlaÅŸabilirsiniz.
    Ä°htiyacÄ±nÄ±z olan her ÅŸeyi tek bir yerden bulun.
  `
  return gonder(alici, 'HoÅŸ geldiniz! ğŸ‘‹', sablon('almakistiyor.com\'a hoÅŸ geldiniz', icerik, 'Hemen BaÅŸla', SITE_URL))
}

