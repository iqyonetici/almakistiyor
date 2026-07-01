// src/lib/destekDB.js — Yardım & Destek + Hesap Ayarları
import { supabase } from './supabase'

// === DESTEK TALEPLERİ ===
export async function destekTalepGonder({ email, ad, tur, konu, mesaj }) {
  if (!supabase) return { error: 'Bağlantı yok' }
  const { data, error } = await supabase.rpc('destek_talebi_olustur', {
    p_tur: tur || 'soru',
    p_konu: konu,
    p_kullanici_ad: ad || null,
    p_kullanici_email: email || null,
    p_mesaj: mesaj,
  })
  return { data, error }
}

// Kullanıcının kendi taleplerini getir
export async function kullaniciTalepleri(email) {
  if (!supabase || !email) return []
  const { data } = await supabase.from('destek_talepleri')
    .select('*').eq('kullanici_email', email)
    .order('created_at', { ascending: false })
  return data || []
}

// === ADMIN: tüm talepler ===
export async function tumDestekTalepleri() {
  if (!supabase) return []
  const { data } = await supabase.from('destek_talepleri')
    .select('*').order('created_at', { ascending: false })
  return data || []
}

export async function destekTalepGuncelle(id, degisiklikler) {
  if (!supabase) return
  return await supabase.from('destek_talepleri').update(degisiklikler).eq('id', id)
}

export async function destekYanitla(id, yanit, durum = 'cozuldu') {
  if (!supabase) return
  return await supabase.from('destek_talepleri').update({
    admin_yanit: yanit, durum, yanit_tarihi: new Date().toISOString(),
  }).eq('id', id)
}

// === HESAP AYARLARI ===
// Kullanıcı profilini getir (email ile, ilk kayıt)
export async function profilGetir(email) {
  if (!supabase || !email) return null
  const { data } = await supabase.from('kullanicilar')
    .select('*').eq('email', email)
    .order('created_at', { ascending: true }).limit(1)
  return data && data.length ? data[0] : null
}

// Profil güncelle (ad, soyad, telefon, sehir, firma)
export async function profilGuncelle(email, degisiklikler) {
  if (!supabase || !email) return { error: 'Email yok' }
  return await supabase.from('kullanicilar')
    .update(degisiklikler).eq('email', email)
}

// Şifre değiştir (Supabase Auth)
export async function sifreDegistir(yeniSifre) {
  if (!supabase) return { error: 'Bağlantı yok' }
  return await supabase.auth.updateUser({ password: yeniSifre })
}
