// src/lib/limitDB.js
import { supabase } from './supabase'

export async function kullaniciHaklari(email) {
  if (!supabase || !email) {
    return { paket: 'misafir', gunlukIlan: 1, gunlukMesaj: 0, gunlukTelefon: 0, telefonGoster: false, engelli: false }
  }
  const { data: kList } = await supabase
    .from('kullanicilar')
    .select('paket, engelli')
    .eq('email', email)
    .order('created_at', { ascending: true })
    .limit(1)
  const k = kList && kList.length ? kList[0] : null
  const paketKod = k?.paket || 'ucretsiz'

  const { data: pList } = await supabase
    .from('paketler')
    .select('gunluk_ilan, gunluk_mesaj, gunluk_telefon, telefon_goster')
    .eq('kod', paketKod)
    .limit(1)
  const p = pList && pList.length ? pList[0] : null

  return {
    paket: paketKod,
    gunlukIlan: p?.gunluk_ilan ?? 3,
    gunlukMesaj: p?.gunluk_mesaj ?? 1,
    gunlukTelefon: p?.gunluk_telefon ?? 0,
    telefonGoster: p?.telefon_goster ?? false,
    engelli: k?.engelli ?? false,
  }
}

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

export async function bugunkuTelefonSayisi(email) {
  if (!supabase || !email) return 0
  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const { count } = await supabase
    .from('telefon_goruntulemeler')
    .select('*', { count: 'exact', head: true })
    .eq('kullanici_email', email)
    .gte('created_at', bugun.toISOString())
  return count || 0
}

export async function ilanHakkiVarMi(user) {
  if (!user?.email) {
    return { izin: true, sebep: 'misafir', kalan: 1 }
  }
  const haklar = await kullaniciHaklari(user.email)
  if (haklar.engelli) {
    return { izin: false, sebep: 'engelli', mesaj: 'Hesabiniz askiya alinmis. Destek ile iletisime gecin.' }
  }
  const bugunku = await bugunkuIlanSayisi(user.email)
  const kalan = haklar.gunlukIlan - bugunku
  if (kalan <= 0) {
    return {
      izin: false, sebep: 'limit', kalan: 0, paket: haklar.paket,
      mesaj: `Gunluk ilan hakkiniz doldu (${haklar.gunlukIlan} ilan/gun). ${haklar.paket === 'ucretsiz' ? 'Daha fazla ilan icin Pro uyelige gecin.' : 'Yarin tekrar deneyebilirsiniz.'}`
    }
  }
  return { izin: true, kalan, toplam: haklar.gunlukIlan, paket: haklar.paket }
}

export async function mesajHakkiVarMi(user) {
  if (!user?.email) {
    return { izin: false, sebep: 'giris-gerekli', mesaj: 'Mesaj gondermek icin giris yapmalisiniz.' }
  }
  const haklar = await kullaniciHaklari(user.email)
  if (haklar.engelli) {
    return { izin: false, sebep: 'engelli', mesaj: 'Hesabiniz askiya alinmis.' }
  }
  const bugunku = await bugunkuMesajSayisi(user.email)
  const kalan = haklar.gunlukMesaj - bugunku
  if (kalan <= 0) {
    return {
      izin: false, sebep: 'limit', kalan: 0, paket: haklar.paket,
      mesaj: `Gunluk mesaj hakkiniz doldu (${haklar.gunlukMesaj} mesaj/gun). ${haklar.paket === 'ucretsiz' ? 'Daha fazla mesaj icin Pro uyelige gecin.' : 'Yarin tekrar deneyebilirsiniz.'}`
    }
  }
  return { izin: true, kalan, toplam: haklar.gunlukMesaj, telefonGoster: haklar.telefonGoster, paket: haklar.paket }
}

// TELEFON KONTROLU + KAYIT (insert-first yaklasimiyla race condition onlendi)
export async function telefonHakkiVarMi(user, ilanId) {
  if (!user?.email) {
    return { izin: false, sebep: 'giris-gerekli', mesaj: 'Telefon gormek icin giris yapmalisiniz.' }
  }
  const haklar = await kullaniciHaklari(user.email)
  if (haklar.engelli) {
    return { izin: false, sebep: 'engelli', mesaj: 'Hesabiniz askiya alinmis.' }
  }
  if (!haklar.telefonGoster || haklar.gunlukTelefon === 0) {
    return {
      izin: false, sebep: 'paket-gerekli', paket: haklar.paket,
      mesaj: 'Telefon numaralarini gormek icin Pro uyelik gereklidir.'
    }
  }

  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const sinirsiz = haklar.gunlukTelefon === 999
  const bugunTarihi = new Date().toISOString().slice(0, 10)

  // Bugun bu ilana zaten bakildi mi? Hak dusmeden tekrar goster
  if (ilanId) {
    const { count: zatenVar } = await supabase
      .from('telefon_goruntulemeler')
      .select('*', { count: 'exact', head: true })
      .eq('kullanici_email', user.email)
      .eq('ilan_id', ilanId)
      .gte('created_at', bugun.toISOString())
    if (zatenVar && zatenVar > 0) {
      const bugunku = await bugunkuTelefonSayisi(user.email)
      return {
        izin: true,
        zatenGoruldu: true,
        kalan: sinirsiz ? 999 : Math.max(0, haklar.gunlukTelefon - bugunku),
        toplam: haklar.gunlukTelefon,
        paket: haklar.paket
      }
    }
  }

  // Once kayit yaz - unique constraint race condition'i engeller
  if (ilanId && supabase) {
    const { error: insErr } = await supabase.from('telefon_goruntulemeler').insert({
      kullanici_email: user.email,
      ilan_id: ilanId,
      tarih: bugunTarihi,
    })

    // Duplicate kayit - zaten gorulmus demek
    if (insErr && insErr.code === '23505') {
      return { izin: true, zatenGoruldu: true, paket: haklar.paket }
    }

    // Diger hata
    if (insErr) {
      console.error('telefon insert hatasi:', insErr)
    }
  }

  // Insert sonrasi toplam sayiyi kontrol et
  const bugunSayisi = await bugunkuTelefonSayisi(user.email)

  if (!sinirsiz && bugunSayisi > haklar.gunlukTelefon) {
    // Limiti asti - az once eklenen kaydi sil
    if (ilanId) {
      await supabase.from('telefon_goruntulemeler')
        .delete()
        .eq('kullanici_email', user.email)
        .eq('ilan_id', ilanId)
        .eq('tarih', bugunTarihi)
    }
    return {
      izin: false, sebep: 'limit', kalan: 0,
      toplam: haklar.gunlukTelefon,
      paket: haklar.paket,
      mesaj: `Gunluk telefon goruntuleme limitinize ulastiniz (${haklar.gunlukTelefon}/gun). Yarin yenilenir veya planini yukseltin.`
    }
  }

  return {
    izin: true,
    kalan: sinirsiz ? 999 : Math.max(0, haklar.gunlukTelefon - bugunSayisi),
    toplam: haklar.gunlukTelefon,
    paket: haklar.paket
  }
}

export async function kalanMesajHakki(email) {
  if (!supabase || !email) return 0
  const haklar = await kullaniciHaklari(email)
  const bugunku = await bugunkuMesajSayisi(email)
  return Math.max(0, haklar.gunlukMesaj - bugunku)
}
