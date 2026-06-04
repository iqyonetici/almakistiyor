// src/lib/limitDB.js — ilan ve mesaj limit kontrolü (CANLI paket bazlı)
import { supabase } from './supabase'

// Kullanıcının paketini ve O PAKETİN güncel haklarını getir
// (kullanicilar.gunluk_mesaj_hakki yerine DOĞRUDAN paketler tablosundan okur
//  böylece admin paketi değiştirince anında yansır)
export async function kullaniciHaklari(email) {
  if (!supabase || !email) {
    return { paket: 'misafir', gunlukIlan: 1, gunlukMesaj: 0, telefonGoster: false, engelli: false }
  }
  // 1. Kullanıcının paket kodunu al
  const { data: k } = await supabase
    .from('kullanicilar')
    .select('paket, engelli')
    .eq('email', email)
    .single()

  const paketKod = k?.paket || 'ucretsiz'

  // 2. O paketin GÜNCEL haklarını paketler tablosundan al
  const { data: p } = await supabase
    .from('paketler')
    .select('gunluk_ilan, gunluk_mesaj, telefon_goster')
    .eq('kod', paketKod)
    .single()

  return {
    paket: paketKod,
    gunlukIlan: p?.gunluk_ilan ?? 3,
    gunlukMesaj: p?.gunluk_mesaj ?? 1,
    telefonGoster: p?.telefon_goster ?? false,
    engelli: k?.engelli ?? false,
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

// Bugün kaç mesaj gönderdi?
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

// İLAN VEREBİLİR Mİ?
export async function ilanHakkiVarMi(user) {
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

// MESAJ GÖNDEREBİLİR Mİ? — her çağrıda CANLI hesaplar
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

// Kalan mesaj hakkını döndür (gösterim için)
export async function kalanMesajHakki(email) {
  if (!supabase || !email) return 0
  const haklar = await kullaniciHaklari(email)
  const bugunku = await bugunkuMesajSayisi(email)
  return Math.max(0, haklar.gunlukMesaj - bugunku)
}
