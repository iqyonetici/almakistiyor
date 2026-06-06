// src/lib/kategoriDB.js — kategorileri Supabase'den çek ve ağaç yap
import { supabase } from './supabase'

// Düz listeyi parent_id'ye göre ağaca dönüştür
function agacYap(duzListe) {
  const harita = {}
  const kokler = []

  // Önce hepsini haritaya koy
  duzListe.forEach(k => {
    harita[k.id] = { ...k, altKategoriler: [] }
  })

  // Parent-child ilişkisini kur
  duzListe.forEach(k => {
    if (k.parent_id && harita[k.parent_id]) {
      harita[k.parent_id].altKategoriler.push(harita[k.id])
    } else if (!k.parent_id) {
      kokler.push(harita[k.id])
    }
  })

  // Sıralama
  const sirala = (liste) => {
    liste.sort((a, b) => (a.sira || 0) - (b.sira || 0))
    liste.forEach(x => x.altKategoriler.length && sirala(x.altKategoriler))
  }
  sirala(kokler)

  return kokler
}

// Tüm aktif kategorileri ağaç olarak getir
export async function kategorileriGetir() {
  if (!supabase) return []
  // Supabase tek sorguda max 1000 satır döndürür.
  // Kategoriler 1000'i aştığı için sayfalama ile hepsini çekiyoruz.
  let tumKayitlar = []
  let sayfa = 0
  const boyut = 1000
  while (true) {
    const { data, error } = await supabase
      .from('kategoriler')
      .select('*')
      .eq('aktif', true)
      .order('sira', { ascending: true })
      .order('label', { ascending: true })
      .range(sayfa * boyut, sayfa * boyut + boyut - 1)
    if (error) { console.error('Kategori çekme hatası:', error?.message); break }
    if (!data || data.length === 0) break
    tumKayitlar = tumKayitlar.concat(data)
    if (data.length < boyut) break  // son sayfa
    sayfa++
  }
  return agacYap(tumKayitlar)
}

// Admin için: aktif/pasif tüm kategoriler
export async function tumKategorileriGetir() {
  if (!supabase) return []
  let tumKayitlar = []
  let sayfa = 0
  const boyut = 1000
  while (true) {
    const { data, error } = await supabase
      .from('kategoriler')
      .select('*')
      .order('sira', { ascending: true })
      .order('label', { ascending: true })
      .range(sayfa * boyut, sayfa * boyut + boyut - 1)
    if (error || !data || data.length === 0) break
    tumKayitlar = tumKayitlar.concat(data)
    if (data.length < boyut) break
    sayfa++
  }
  return agacYap(tumKayitlar)
}

// Kategori ekle
export async function kategoriEkle({ parentId, label, slug, icon, seviye, sira, filtreTip, filtreDeger }) {
  if (!supabase) return { error: 'Supabase yok' }
  return await supabase.from('kategoriler').insert([{
    parent_id: parentId || null,
    label, slug, icon: icon || '',
    seviye: seviye || 1,
    sira: sira || 0,
    aktif: true,
    filtre_tip: filtreTip || null,
    filtre_deger: filtreDeger || null,
  }]).select().single()
}

// Kategori güncelle (aç/kapa, isim değiştir)
export async function kategoriGuncelle(id, degisiklikler) {
  if (!supabase) return { error: 'Supabase yok' }
  return await supabase.from('kategoriler').update(degisiklikler).eq('id', id)
}

// Kategori sil (altları da CASCADE ile silinir)
export async function kategoriSil(id) {
  if (!supabase) return { error: 'Supabase yok' }
  return await supabase.from('kategoriler').delete().eq('id', id)
}

// Admin kontrolü
export async function adminMi(email) {
  if (!supabase || !email) return false
  const { data } = await supabase
    .from('adminler')
    .select('email')
    .eq('email', email)
    .maybeSingle()
  return !!data
}
