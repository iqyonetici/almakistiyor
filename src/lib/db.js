import { supabase } from './supabase'

// ==================== İLAN FONKSİYONLARI ====================

export async function ilanListele({ kategori, altKategori, sehir, ilce, emlakTip, marka, kullaniciEmail, limit = 50 } = {}) {
  if (!supabase) return { data: [], error: 'Supabase bağlı değil' }

  // ilanlar_pro view'i kullan - kullanici_pro alanını da getirir
  let q = supabase
    .from('ilanlar_pro')
    .select('*')
    .order('siralama_skoru', { ascending: false })
    .limit(limit)

  if (kullaniciEmail) {
    q = q.or(`and(durum.eq.aktif,onay_durumu.eq.onaylandi),kullanici_email.eq.${kullaniciEmail}`)
  } else {
    q = q.eq('durum', 'aktif').eq('onay_durumu', 'onaylandi')
  }

  if (emlakTip) {
    q = q.eq('emlak_tip', emlakTip)
  } else if (marka) {
    q = q.ilike('markalar', '%' + marka + '%')
  } else if (altKategori) {
    // alt_kategori (2.sv) VEYA alt_kategori2 (3.sv) VEYA kategori_yol icinde (her seviye) ara
    q = q.or(`alt_kategori.eq.${altKategori},alt_kategori2.eq.${altKategori},kategori_yol.cs.[{"slug":"${altKategori}"}]`)
  } else if (kategori) {
    q = q.eq('kategori', kategori)
  }

  if (sehir) q = q.eq('sehir', sehir)
  if (ilce) q = q.or('ilce.eq.' + ilce + ',ilce.is.null,ilce.eq.')
  return await q
}

export async function ilanOlustur(ilanData, user) {
  if (!supabase) return { data: null, error: 'Supabase bağlı değil' }

  const vasitaMarka = ilanData.vasitaMarka || (ilanData.markalar?.length ? ilanData.markalar[0] : null)
  const vasitaModel = ilanData.vasitaModel || null
  const vasitaVersiyon = ilanData.vasitaVersiyon || null

  let markaStr = null
  if (vasitaMarka) {
    markaStr = vasitaModel ? `${vasitaMarka} ${vasitaModel}${vasitaVersiyon?' '+vasitaVersiyon:''}` : vasitaMarka
  } else if (ilanData.markalar?.length) {
    markaStr = ilanData.markalar.join(',')
  }

  const { data, error } = await supabase
    .from('ilanlar')
    .insert([{
      kullanici_ad: user?.ad || ilanData.ad,
      kullanici_soyad: user?.soyad || ilanData.soyad,
      kullanici_telefon: user?.telefon || ilanData.telefon,
      kullanici_email: user?.email || null,
      kategori: ilanData.kategori,
      alt_kategori: ilanData.altKategori || ilanData.vasitaAltTip || null,
      alt_kategori2: ilanData.altKategori2 || null,
      kategori_yol: ilanData.kategoriYol?.length ? ilanData.kategoriYol : [],
      konumlar: ilanData.konumlar?.length ? ilanData.konumlar : [],
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
      markalar: markaStr,
      yil_min: ilanData.yilMin ? Number(ilanData.yilMin) : null,
      yil_max: ilanData.yilMax ? Number(ilanData.yilMax) : null,
      km_max: ilanData.kmMax ? Number(ilanData.kmMax) : null,
      yakit: ilanData.yakit?.length ? ilanData.yakit.join(',') : null,
      vites: ilanData.vites?.length ? ilanData.vites.join(',') : null,
      aciklama: ilanData.aciklama || null,
      durum: 'pasif',
      onay_durumu: 'beklemede',
      goruntuleme: 0,
      iletisim_tercihi: ilanData.iletisimTercihi || 'mesaj',
    }])
    .select()
    .single()
  return { data, error }
}

export async function kullanicIlanlari(kullaniciEmail) {
  if (!supabase) return { data: [], error: 'Supabase bağlı değil' }
  return await supabase.from('ilanlar').select('*').eq('kullanici_email', kullaniciEmail).order('created_at', { ascending: false })
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
  const { data, error } = await supabase.from('mesajlar').insert([{ ilan_id: ilanId, gonderen_email: gonderenEmail, gonderen_ad: gonderenAd, gonderen_firma: gonderenFirma || null, alici_email: aliciEmail, metin, okundu: false }]).select().single()
  return { data, error }
}

export async function mesajlariGetir(kullaniciEmail) {
  if (!supabase) return { data: [], error: 'Supabase bağlı değil' }
  return await supabase.from('mesajlar').select('*').eq('alici_email', kullaniciEmail).order('created_at', { ascending: false })
}

export async function mesajOkunduIsaretle(mesajId) {
  if (!supabase) return
  await supabase.from('mesajlar').update({ okundu: true }).eq('id', mesajId)
}

export async function yanitGonder({ mesajId, gonderenEmail, gonderenAd, metin }) {
  if (!supabase) return { error: 'Supabase bağlı değil' }
  return await supabase.from('yanitlar').insert([{ mesaj_id: mesajId, gonderen_email: gonderenEmail, gonderen_ad: gonderenAd, metin }]).select().single()
}

export async function mesajYanitlari(mesajId) {
  if (!supabase) return { data: [], error: null }
  return await supabase.from('yanitlar').select('*').eq('mesaj_id', mesajId).order('created_at', { ascending: true })
}

export async function mesajSayisi(gonderenEmail, ilanId) {
  if (!supabase) return 0
  const { count } = await supabase.from('mesajlar').select('*', { count: 'exact', head: true }).eq('gonderen_email', gonderenEmail).eq('ilan_id', ilanId)
  return count || 0
}

// ==================== KONUŞMA FONKSİYONLARI ====================

export async function konusmaBaslatVeyaGetir({ ilanId, ilanBaslik, ilanKategori, aliciEmail, aliciAd, saticiEmail, saticiAd, saticiIfirma }) {
  if (!supabase) return { data: null, error: 'Supabase bağlı değil' }
  const { data: mevcut } = await supabase.from('konusmalar').select('*').eq('ilan_id', ilanId).eq('alici_email', aliciEmail).eq('satici_email', saticiEmail).single()
  if (mevcut) return { data: mevcut, error: null }
  const { data, error } = await supabase.from('konusmalar').insert([{ ilan_id: ilanId, ilan_baslik: ilanBaslik, ilan_kategori: ilanKategori, alici_email: aliciEmail, alici_ad: aliciAd, satici_email: saticiEmail, satici_ad: saticiAd, satici_firma: saticiIfirma || null }]).select().single()
  return { data, error }
}

export async function konusmalariGetir(kullaniciEmail) {
  if (!supabase) return { data: [], error: null }
  const { data: alici } = await supabase.from('konusmalar').select('*').eq('alici_email', kullaniciEmail).order('guncellendi_at', { ascending: false })
  const { data: satici } = await supabase.from('konusmalar').select('*').eq('satici_email', kullaniciEmail).order('guncellendi_at', { ascending: false })
  const hepsi = [...(alici||[]), ...(satici||[])]
  const tekrarsiz = hepsi.filter((k,i,a) => a.findIndex(x=>x.id===k.id)===i)
  tekrarsiz.sort((a,b) => new Date(b.guncellendi_at) - new Date(a.guncellendi_at))
  return { data: tekrarsiz, error: null }
}

export async function konusmaMesajlariGetir(konusmaId) {
  if (!supabase) return { data: [], error: null }
  return await supabase.from('konusma_mesajlari').select('*').eq('konusma_id', konusmaId).order('created_at', { ascending: true })
}

export async function konusmaMesajGonder({ konusmaId, gonderenEmail, gonderenAd, metin, gonderenAliciMi }) {
  if (!supabase) return { data: null, error: 'Supabase bağlı değil' }
  const { data, error } = await supabase.from('konusma_mesajlari').insert([{ konusma_id: konusmaId, gonderen_email: gonderenEmail, gonderen_ad: gonderenAd, metin }]).select().single()
  if (!error) {
    await supabase.from('konusmalar').update({ son_mesaj: metin.slice(0,100), guncellendi_at: new Date().toISOString() }).eq('id', konusmaId); try { const { data: kon } = await supabase.from('konusmalar').select('*').eq('id', konusmaId).single(); if (kon) { await supabase.from('konusmalar').update(gonderenEmail === kon.satici_email ? { okunmamis_alici: (kon.okunmamis_alici||0)+1 } : { okunmamis_satici: (kon.okunmamis_satici||0)+1 }).eq('id', konusmaId) } if (kon && typeof window !== 'undefined') { const hedef = gonderenEmail === kon.satici_email ? { email: kon.alici_email, ad: kon.alici_ad } : { email: kon.satici_email, ad: kon.satici_ad }; if (hedef.email && hedef.email.includes('@')) { fetch('/api/mesaj-mail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aliciEmail: hedef.email, aliciAd: hedef.ad, gonderenAd, ilanBaslik: kon.ilan_baslik, mesajMetni: metin }) }).catch(() => {}) } } } catch (e) {}
  }
  return { data, error }
}

export async function konusmaOkunduIsaretle(konusmaId, kullaniciEmail, rolAlici) {
  if (!supabase) return
  const guncelle = rolAlici ? { okunmamis_alici: 0 } : { okunmamis_satici: 0 }
  await supabase.from('konusmalar').update(guncelle).eq('id', konusmaId)
  await supabase.from('konusma_mesajlari').update({ okundu: true }).eq('konusma_id', konusmaId).neq('gonderen_email', kullaniciEmail)
}
