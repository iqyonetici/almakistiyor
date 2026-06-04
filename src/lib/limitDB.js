// src/lib/limitDB.js — ilan ve mesaj limit kontrolü (pakete bağlı)
import { supabase } from './supabase'

// Kullanıcının güncel paket bilgisini + haklarını getir
export async function kullaniciHaklari(email) {
  if (!supabase || !email) {
    return { paket: 'misafir', gunlukIlan: 1, gunlukMesaj: 0, telefonGoster: false }
  }
  const { data } = await supabase
    .from('kullanicilar')
    .select('paket, gunluk_ilan_hakki, gunluk_mesaj_hakki, engelli')
    .eq('email', email)
    .single()

  if (!data) return { paket: 'misafir', gunlukIlan: 1, gunlukMesaj: 0, telefonGoster: false }

  // Paket detayını çek (telefon gösterme yetkisi için)
  const { data: paket } = await supabase
    .from('paketler')
    .select('telefon_goster')
    .eq('kod', data.paket || 'ucretsiz')
    .single()

  return {
    paket: data.paket || 'ucretsiz',
    gunlukIlan: data.gunluk_ilan_hakki ?? 3,
    gunlukMesaj: data.gunluk_mesaj_hakki ?? 1,
    telefonGoster: paket?.telefon_goster ?? false,
    engelli: data.engelli ?? false,
  }
}

// Bugün kaç ilan verdi?
export async function bugunkuIlanSayisi(email) {
  if (!supabase || !email) return 0
  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const { count } = await supabase
    .from('ilanlar')
    .select('*', { count: 'exact', head: true })
    .eq('kullanici_email', email)
    .gte('created_at', bugun.toISOString())
  return count || 0
}

// Bugün kaç mesaj/teklif gönderdi?
export async function bugunkuMesajSayisi(email) {
  if (!supabase || !email) return 0
  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const { count } = await supabase
    .from('konusma_mesajlari')
    .select('*', { count: 'exact', head: true })
    .eq('gonderen_email', email)
    .gte('created_at', bugun.toISOString())
  return count || 0
}

// İLAN VEREBİLİR Mİ? — kontrol
export async function ilanHakkiVarMi(user) {
  // Misafir (üye değil): 1 ilan hakkı (localStorage'da sayılır, burada DB yok)
  if (!user?.email) {
    return { izin: true, sebep: 'misafir', kalan: 1 }
  }
  const haklar = await kullaniciHaklari(user.email)
  if (haklar.engelli) {
    return { izin: false, sebep: 'engelli', mesaj: 'Hesabınız askıya alınmış. Destek ile iletişime geçin.' }
  }
  const bugunku = await bugunkuIlanSayisi(user.email)
  const kalan = haklar.gunlukIlan - bugunku
  if (kalan <= 0) {
    return {
      izin: false, sebep: 'limit', kalan: 0, paket: haklar.paket,
      mesaj: `Günlük ilan hakkınız doldu (${haklar.gunlukIlan} ilan/gün). ${haklar.paket === 'ucretsiz' ? 'Daha fazla ilan için Pro üyeliğe geçin.' : 'Yarın tekrar deneyebilirsiniz.'}`
    }
  }
  return { izin: true, kalan, toplam: haklar.gunlukIlan, paket: haklar.paket }
}

// MESAJ GÖNDEREBİLİR Mİ? — kontrol
export async function mesajHakkiVarMi(user) {
  if (!user?.email) {
    return { izin: false, sebep: 'giris-gerekli', mesaj: 'Mesaj göndermek için giriş yapmalısınız.' }
  }
  const haklar = await kullaniciHaklari(user.email)
  if (haklar.engelli) {
    return { izin: false, sebep: 'engelli', mesaj: 'Hesabınız askıya alınmış.' }
  }
  const bugunku = await bugunkuMesajSayisi(user.email)
  const kalan = haklar.gunlukMesaj - bugunku
  if (kalan <= 0) {
    return {
      izin: false, sebep: 'limit', kalan: 0, paket: haklar.paket,
      mesaj: `Günlük mesaj hakkınız doldu (${haklar.gunlukMesaj} mesaj/gün). ${haklar.paket === 'ucretsiz' ? 'Daha fazla mesaj için Pro üyeliğe geçin.' : 'Yarın tekrar deneyebilirsiniz.'}`
    }
  }
  return { izin: true, kalan, toplam: haklar.gunlukMesaj, telefonGoster: haklar.telefonGoster, paket: haklar.paket }
}
