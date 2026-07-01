// src/lib/adminDB.js — admin panel veri fonksiyonları
import { supabase } from './supabase'

// ===== DASHBOARD İSTATİSTİKLERİ =====
export async function dashboardStats() {
  if (!supabase) return {}
  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const buguniso = bugun.toISOString()

  const [ilanAktif, ilanBekleyen, ilanToplam, kullanici, bugunIlan, bugunUye] = await Promise.all([
    supabase.from('ilanlar').select('*',{count:'exact',head:true}).eq('durum','aktif'),
    supabase.from('ilanlar').select('*',{count:'exact',head:true}).eq('onay_durumu','beklemede'),
    supabase.from('ilanlar').select('*',{count:'exact',head:true}),
    supabase.from('kullanicilar').select('*',{count:'exact',head:true}),
    supabase.from('ilanlar').select('*',{count:'exact',head:true}).gte('created_at',buguniso),
    supabase.from('kullanicilar').select('*',{count:'exact',head:true}).gte('created_at',buguniso),
  ])

  return {
    ilanAktif: ilanAktif.count || 0,
    ilanBekleyen: ilanBekleyen.count || 0,
    ilanToplam: ilanToplam.count || 0,
    kullanici: kullanici.count || 0,
    bugunIlan: bugunIlan.count || 0,
    bugunUye: bugunUye.count || 0,
  }
}

// Son 7 günün ilan sayısı (grafik için)
export async function son7GunIlan() {
  if (!supabase) return []
  const sonuc = []
  for (let i = 6; i >= 0; i--) {
    const gun = new Date(); gun.setDate(gun.getDate() - i); gun.setHours(0,0,0,0)
    const ertesi = new Date(gun); ertesi.setDate(ertesi.getDate() + 1)
    const { count } = await supabase.from('ilanlar')
      .select('*',{count:'exact',head:true})
      .gte('created_at', gun.toISOString())
      .lt('created_at', ertesi.toISOString())
    sonuc.push({ gun: gun.toLocaleDateString('tr-TR',{weekday:'short'}), sayi: count || 0 })
  }
  return sonuc
}

// ===== KULLANICI YÖNETİMİ =====
export async function kullanicilariGetir(arama = '') {
  if (!supabase) return []
  let q = supabase.from('kullanicilar').select('*').order('created_at',{ascending:false}).limit(200)
  if (arama) q = q.or(`ad.ilike.%${arama}%,email.ilike.%${arama}%`)
  const { data } = await q
  return data || []
}

export async function kullaniciEngelle(id, engelli) {
  if (!supabase) return
  return await supabase.from('kullanicilar').update({ engelli }).eq('id', id)
}

export async function kullaniciPaketDegistir(id, paket) {
  if (!supabase) return
  // Paketin ilan + mesaj haklarını DB'den çek (admin panelden değiştirilebilir)
  const { data: p } = await supabase.from('paketler').select('gunluk_ilan, gunluk_mesaj').eq('kod', paket).single()
  const gunlukIlan = p?.gunluk_ilan ?? 3
  const gunlukMesaj = p?.gunluk_mesaj ?? 1
  return await supabase.from('kullanicilar').update({
    paket,
    gunluk_ilan_hakki: gunlukIlan,
    gunluk_mesaj_hakki: gunlukMesaj,
    paket_bitis: paket === 'ucretsiz' ? null : new Date(Date.now()+30*24*60*60*1000).toISOString(),
  }).eq('id', id)
}

// ===== ŞİKAYETLER =====
export async function sikayetleriGetir() {
  if (!supabase) return []
  const { data } = await supabase.from('sikayetler').select('*').order('created_at',{ascending:false})
  return data || []
}
export async function sikayetDurumGuncelle(id, durum) {
  if (!supabase) return
  return await supabase.from('sikayetler').update({ durum }).eq('id', id)
}

// ===== PAKETLER =====
export async function paketleriGetir() {
  if (!supabase) return []
  const { data } = await supabase.from('paketler').select('*').order('sira')
  return data || []
}
export async function paketGuncelle(id, degisiklikler) {
  if (!supabase) return
  return await supabase.from('paketler').update(degisiklikler).eq('id', id)
}

// ===== İLAN LİMİT KONTROLÜ =====
// Kullanıcının bugün kaç ilan verdiğini say
export async function bugunkuIlanSayisi(email) {
  if (!supabase || !email) return 0
  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const { count } = await supabase.from('ilanlar')
    .select('*',{count:'exact',head:true})
    .eq('kullanici_email', email)
    .gte('created_at', bugun.toISOString())
  return count || 0
}

// ===== DESTEK TALEPLERİ (admin) =====
export async function adminDestekTalepleri() {
  if (!supabase) return []
  const { data } = await supabase.from('destek_talepleri').select('*').order('created_at',{ascending:false})
  return data || []
}
export async function adminDestekYanitla(id, yanit, durum) {
  if (!supabase) return
  return await supabase.from('destek_talepleri').update({
    admin_yanit: yanit, durum: durum || 'cozuldu', yanit_tarihi: new Date().toISOString(),
  }).eq('id', id)
}
export async function adminDestekDurum(id, durum) {
  if (!supabase) return
  return await supabase.from('destek_talepleri').update({ durum }).eq('id', id)
}
