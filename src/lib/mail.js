// src/lib/mail.js
// Resend ile e-posta bildirimleri

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const GONDEREN = 'AlmakIstiyor <noreply@almakistiyor.net>'
const SITE_URL = 'https://almakistiyor.com'

// Ortak HTML şablon sarmalayıcı
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
      Bu e-posta almakistiyor.com tarafından gönderildi.<br>
      Talebinizle ilgili bildirimler için bu adresi kullanıyoruz.
    </div>
  </div>
  `
}

// Genel gönderim fonksiyonu
async function gonder(alici, konu, html) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY yok, mail gönderilemedi')
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
      console.error('Mail hatası:', error)
      return { hata: error.message }
    }
    return { basarili: true, id: data?.id }
  } catch (err) {
    console.error('Mail gönderim hatası:', err)
    return { hata: err.message }
  }
}

// 1. İlan oluşturuldu (onay bekliyor)
export async function ilanOlusturulduMaili(alici, ad, ilanBaslik) {
  const icerik = `
    Merhaba ${ad},<br><br>
    <strong>"${ilanBaslik}"</strong> başlıklı talebiniz başarıyla alındı ve onay sürecine girdi.<br><br>
    Yöneticilerimiz talebinizi inceledikten sonra yayına alınacak. Genellikle birkaç saat içinde onaylanır.
    Onaylandığında size tekrar bilgi vereceğiz.
  `
  return gonder(alici, 'Talebiniz alındı', sablon('Talebiniz onay sürecinde', icerik, 'Talebimi Görüntüle', `${SITE_URL}/panel`))
}

// 2. İlan onaylandı (yayında)
export async function ilanOnaylandiMaili(alici, ad, ilanBaslik) {
  const icerik = `
    Merhaba ${ad},<br><br>
    Harika haber! <strong>"${ilanBaslik}"</strong> başlıklı talebiniz onaylandı ve artık yayında.<br><br>
    Satıcılar talebinizi görebilir ve size teklif gönderebilir. Gelen teklifleri kaçırmamak için
    e-postanızı ve hesabınızı düzenli kontrol edin.
  `
  return gonder(alici, 'Talebiniz yayında!', sablon('Talebiniz onaylandı', icerik, 'Talebimi Görüntüle', `${SITE_URL}/panel`))
}

// 3. İlan reddedildi
export async function ilanReddedildiMaili(alici, ad, ilanBaslik, sebep) {
  const icerik = `
    Merhaba ${ad},<br><br>
    <strong>"${ilanBaslik}"</strong> başlıklı talebiniz maalesef onaylanamadı.<br><br>
    ${sebep ? `<strong>Sebep:</strong> ${sebep}<br><br>` : ''}
    Talebinizi düzenleyip tekrar gönderebilirsiniz. Sorularınız için destek ekibimize ulaşabilirsiniz.
  `
  return gonder(alici, 'Talebiniz hakkında', sablon('Talebiniz onaylanamadı', icerik, 'Yeni Talep Oluştur', `${SITE_URL}`))
}

// 4. Yeni mesaj geldi
export async function yeniMesajMaili(alici, ad, gonderenAd, ilanBaslik, mesajOnizleme) {
  const icerik = `
    Merhaba ${ad},<br><br>
    <strong>${gonderenAd}</strong> size <strong>"${ilanBaslik}"</strong> talebiniz hakkında mesaj gönderdi:<br><br>
    <div style="background:#f1f5f9;border-left:3px solid #0D7A6B;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;color:#475569">
      "${mesajOnizleme}"
    </div><br>
    Yanıtlamak için mesajlarınıza gidin.
  `
  return gonder(alici, `${gonderenAd} size mesaj gönderdi`, sablon('Yeni mesajınız var', icerik, 'Mesajı Görüntüle', `${SITE_URL}/panel`))
}

// 5. Hoş geldin (kayıt sonrası)
export async function hosgeldinMaili(alici, ad) {
  const icerik = `
    Merhaba ${ad},<br><br>
    almakistiyor.com'a hoş geldiniz! Hesabınız başarıyla oluşturuldu.<br><br>
    Artık talep oluşturabilir, satıcılardan teklif alabilir ve onlarla mesajlaşabilirsiniz.
    İhtiyacınız olan her şeyi tek bir yerden bulun.
  `
  return gonder(alici, 'Hoş geldiniz!', sablon('almakistiyor.com\'a hoş geldiniz', icerik, 'Hemen Başla', SITE_URL))
}
