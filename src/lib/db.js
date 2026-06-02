import { supabase } from './supabase'

// ==================== İLAN FONKSİYONLARI ====================

export async function ilanListele({ kategori, sehir, limit = 20 } = {}) {
  if (!supabase) return { data: [], error: 'Supabase bağlı değil' }
  let q = supabase
    .from('ilanlar')
    .select('*')
    .eq('durum', 'aktif')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (kategori) q = q.eq('kategori', kategori)
  if (sehir) q = q.eq('sehir', sehir)
  return await q
}

export async function ilanOlustur(ilanData, user) {
  if (!supabase) return { data: null, error: 'Supabase bağlı değil' }
  const { data, error } = await supabase
    .from('ilanlar')
    .insert([{
      kullanici_ad: user?.ad || ilanData.ad,
      kullanici_soyad: user?.soyad || ilanData.soyad,
      kullanici_telefon: user?.telefon || ilanData.telefon,
      kullanici_email: user?.email || null,
      kategori: ilanData.kategori,
      islem_turu: ilanData.islemTuru,
      sehir: ilanData.sehir,
      ilce: ilanData.ilce || null,
      fiyat_min: ilanData.fiyatMin ? Number(ilanData.fiyatMin) : null,
      fiyat_max: ilanData.fiyatMax ? Number(ilanData.fiyatMax) : null,
      m2_min: ilanData.m2Min ? Number(ilanData.m2Min) : null,
      m2_max: ilanData.m2Max ? Number(ilanData.m2Max) : null,
      oda: ilanData.oda?.length ? ilanData.oda.join(',') : null,
      tercihler: ilanData.tercihler?.length ? ilanData.tercihler.join(',') : null,
      emlak_tip: ilanData.emlakTip || null,
      markalar: ilanData.markalar?.length ? ilanData.markalar.join(',') : null,
      yil_min: ilanData.yilMin ? Number(ilanData.yilMin) : null,
      yil_max: ilanData.yilMax ? Number(ilanData.yilMax) : null,
      km_min: ilanData.kmMin ? Number(ilanData.kmMin) : null,
      km_max: ilanData.kmMax ? Number(ilanData.kmMax) : null,
      yakit: ilanData.yakit?.length ? ilanData.yakit.join(',') : null,
      vites: ilanData.vites?.length ? ilanData.vites.join(',') : null,
      aciklama: ilanData.aciklama || null,
      durum: 'aktif',
      goruntuleme: 0,
    }])
    .select()
    .single()
  return { data, error }
}

export async function kullanicIlanlari(kullaniciEmail) {
  if (!supabase) return { data: [], error: 'Supabase bağlı değil' }
  return await supabase
    .from('ilanlar')
    .select('*')
    .eq('kullanici_email', kullaniciEmail)
    .order('created_at', { ascending: false })
}

export async function ilanSil(ilanId) {
  if (!supabase) return { error: 'Supabase bağlı değil' }
  return await supabase.from('ilanlar').delete().eq('id', ilanId)
}

export async function ilanDurumGuncelle(ilanId, durum) {
  if (!supabase) return { error: 'Supabase bağlı değil' }
  return await supabase.from('ilanlar').update({ durum }).eq('id', ilanId)
}

export async function goruntulemeArttir(ilanId) {
  if (!supabase) return
  await supabase.rpc('goruntuleme_arttir', { ilan_id: ilanId })
}

// ==================== MESAJ FONKSİYONLARI ====================

export async function mesajGonder({ ilanId, gonderenEmail, gonderenAd, gonderenFirma, aliciEmail, metin }) {
  if (!supabase) return { data: null, error: 'Supabase bağlı değil' }
  const { data, error } = await supabase
    .from('mesajlar')
    .insert([{
      ilan_id: ilanId,
      gonderen_email: gonderenEmail,
      gonderen_ad: gonderenAd,
      gonderen_firma: gonderenFirma || null,
      alici_email: aliciEmail,
      metin,
      okundu: false,
    }])
    .select()
    .single()
  return { data, error }
}

export async function mesajlariGetir(kullaniciEmail) {
  if (!supabase) return { data: [], error: 'Supabase bağlı değil' }
  return await supabase
    .from('mesajlar')
    .select('*, ilanlar(baslik, kategori, sehir)')
    .eq('alici_email', kullaniciEmail)
    .order('created_at', { ascending: false })
}

export async function mesajOkunduIsaretle(mesajId) {
  if (!supabase) return
  await supabase.from('mesajlar').update({ okundu: true }).eq('id', mesajId)
}

export async function yanıtGonder({ mesajId, gonderenEmail, gonderenAd, metin }) {
  if (!supabase) return { error: 'Supabase bağlı değil' }
  return await supabase
    .from('yanıtlar')
    .insert([{ mesaj_id: mesajId, gonderen_email: gonderenEmail, gonderen_ad: gonderenAd, metin }])
    .select()
    .single()
}

export async function mesajYanitlari(mesajId) {
  if (!supabase) return { data: [], error: null }
  return await supabase
    .from('yanıtlar')
    .select('*')
    .eq('mesaj_id', mesajId)
    .order('created_at', { ascending: true })
}

// Satıcının bir alıcıya kaç mesaj gönderdiğini say (5 limit için)
export async function mesajSayisi(gonderenEmail, ilanId) {
  if (!supabase) return 0
  const { count } = await supabase
    .from('mesajlar')
    .select('*', { count: 'exact', head: true })
    .eq('gonderen_email', gonderenEmail)
    .eq('ilan_id', ilanId)
  return count || 0
}
