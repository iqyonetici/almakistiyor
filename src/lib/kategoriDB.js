// src/lib/kategoriDB.js — kategorileri Supabase'den çek ve ağaç yap
import { supabase } from './supabase'

// ---- Önbellek ayarları (kategori ağacı nadiren değişir) ----
const ONBELLEK_ANAHTAR = 'almak_kategori_duz_v1'
const ONBELLEK_OMUR = 24 * 60 * 60 * 1000 // 24 saat (ms)

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

// Aktif kategorilerin DÜZ listesini DB'den çek — sayfaları PARALEL ister
async function aktifKategorileriCek() {
  const boyut = 1000

  // 1) Toplam aktif kayıt sayısını öğren (tek, hafif sorgu — satır döndürmez)
  let toplam = null
  try {
    const { count } = await supabase
      .from('kategoriler')
      .select('id', { count: 'exact', head: true })
      .eq('aktif', true)
    toplam = count
  } catch (e) { toplam = null }

  // 2a) Sayı biliniyorsa: tüm sayfaları AYNI ANDA iste
  if (typeof toplam === 'number' && toplam >= 0) {
    const sayfaSayisi = Math.max(1, Math.ceil(toplam / boyut))
    const istekler = []
    for (let s = 0; s < sayfaSayisi; s++) {
      istekler.push(
        supabase
          .from('kategoriler')
          .select('*')
          .eq('aktif', true)
          .order('sira', { ascending: true })
          .order('label', { ascending: true })
          .range(s * boyut, s * boyut + boyut - 1)
      )
    }
    const sonuclar = await Promise.all(istekler)
    let tum = []
    for (const r of sonuclar) {
      if (r?.error) { console.error('Kategori çekme hatası:', r.error?.message) }
      if (r?.data) tum = tum.concat(r.data)
    }
    return tum
  }

  // 2b) Sayı alınamadıysa (eski yöntem, güvenli yedek): sıralı sayfalama
  let tumKayitlar = []
  let sayfa = 0
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
    if (data.length < boyut) break
    sayfa++
  }
  return tumKayitlar
}

// DB'den taze çek + önbelleğe yaz
async function tazeCekVeOnbellekle() {
  const duz = await aktifKategorileriCek()
  if (typeof window !== 'undefined' && duz && duz.length) {
    try {
      localStorage.setItem(ONBELLEK_ANAHTAR, JSON.stringify({ ts: Date.now(), duz }))
    } catch (e) { /* localStorage dolu/erişilemez — sorun değil */ }
  }
  return agacYap(duz)
}

// Tüm aktif kategorileri ağaç olarak getir
// - Önce localStorage önbelleğinden ANINDA döner (varsa)
// - Önbellek bayatsa arka planda sessizce tazeler
// - tazele:true verilirse önbelleği yok sayıp DB'den çeker
export async function kategorileriGetir({ tazele = false } = {}) {
  if (!supabase) return []

  // 1) Tarayıcıdaysak ve taze isteği yoksa: önbelleğe bak
  if (!tazele && typeof window !== 'undefined') {
    try {
      const ham = localStorage.getItem(ONBELLEK_ANAHTAR)
      if (ham) {
        const { ts, duz } = JSON.parse(ham)
        if (Array.isArray(duz) && duz.length) {
          // Bayatsa arka planda tazele (kullanıcı beklemez)
          if (Date.now() - ts > ONBELLEK_OMUR) {
            tazeCekVeOnbellekle().catch(() => {})
          }
          return agacYap(duz) // anında dön
        }
      }
    } catch (e) { /* bozuk önbellek — yok say, DB'den çek */ }
  }

  // 2) Önbellek yok / taze isteniyor → DB'den çek
  return tazeCekVeOnbellekle()
}

// Önbelleği temizle (örn. admin kategori ekleyip/sildikten sonra çağrılabilir)
export function kategoriOnbelleginiTemizle() {
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(ONBELLEK_ANAHTAR) } catch (e) {}
  }
}

// Admin için: aktif/pasif tüm kategoriler (önbelleksiz — her zaman taze)
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
