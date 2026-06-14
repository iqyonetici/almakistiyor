// src/pages/api/misafir-kayit.js
import { createClient } from '@supabase/supabase-js'
import { ilanOlusturulduMaili, hosgeldinMaili } from '../../lib/mail'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ hata: 'Sadece POST' })

  const { ad, soyad, email, telefon, sifre, ilanData } = req.body

  if (!email || !ad || !telefon || !sifre) {
    return res.status(400).json({ hata: 'Tüm alanlar zorunlu' })
  }
  if (sifre.length < 6) {
    return res.status(400).json({ hata: 'Şifre en az 6 karakter olmalı' })
  }

  const temizEmail = email.toLowerCase().trim()

  try {
    // 1. Bu email zaten kayıtlı mı?
    const { data: mevcutKullanici } = await supabase
      .from('kullanicilar')
      .select('id, email, supabase_id')
      .eq('email', temizEmail)
      .single()

    let supabaseId = mevcutKullanici?.supabase_id
    let kullaniciId = mevcutKullanici?.id
    let session = null

    if (mevcutKullanici) {
      // Mevcut kullanıcı — şifreyle giriş dene
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: temizEmail,
        password: sifre,
      })
      if (!loginError) {
        session = loginData.session
      }
      // Giriş başarısız olsa bile ilana ekleyelim (şifre yanlış olabilir, engellemeyelim)
    } else {
      // 2. Yeni kullanıcı — kayıt oluştur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: temizEmail,
        password: sifre,
        email_confirm: true, // direkt onaylı
        user_metadata: { ad, soyad: soyad || '', telefon }
      })

      if (authError) {
        // Email zaten Auth'ta varsa şifreyle giriş dene
        if (authError.message?.includes('already') || authError.message?.includes('registered')) {
          const { data: loginData } = await supabase.auth.signInWithPassword({
            email: temizEmail, password: sifre,
          })
          session = loginData?.session
          // Auth ID'yi bul
          const { data: users } = await supabase.auth.admin.listUsers()
          const authUser = users?.users?.find(u => u.email === temizEmail)
          supabaseId = authUser?.id
        } else {
          console.error('Auth kayıt hatası:', authError)
        }
      } else {
        supabaseId = authData?.user?.id

        // Yeni kayıt için session al
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: temizEmail,
          password: sifre,
        })
        session = loginData?.session
      }

      // 3. kullanicilar tablosuna ekle
      const { data: yeniKullanici } = await supabase
        .from('kullanicilar')
        .insert({
          supabase_id: supabaseId || null,
          email: temizEmail,
          ad,
          soyad: soyad || '',
          telefon,
          paket: 'ucretsiz',
          gunluk_ilan_hakki: 3,
          gunluk_mesaj_hakki: 1,
        })
        .select()
        .single()

      kullaniciId = yeniKullanici?.id
    }

    // 4. İlanı oluştur
    const vasitaMarka = ilanData.vasitaMarka || (ilanData.markalar?.length ? ilanData.markalar[0] : null)
    const vasitaModel = ilanData.vasitaModel || null
    let markaStr = null
    if (vasitaMarka) {
      markaStr = vasitaModel ? `${vasitaMarka} ${vasitaModel}` : vasitaMarka
    } else if (ilanData.markalar?.length) {
      markaStr = ilanData.markalar.join(',')
    }

    const { data: ilan, error: ilanError } = await supabase
      .from('ilanlar')
      .insert({
        kullanici_ad: ad,
        kullanici_soyad: soyad || '',
        kullanici_telefon: telefon,
        kullanici_email: temizEmail,
        kategori: ilanData.kategori,
        alt_kategori: ilanData.altKategori || null,
        alt_kategori2: ilanData.altKategori2 || null,
        kategori_yol: ilanData.kategoriYol?.length ? ilanData.kategoriYol : [],
        konumlar: ilanData.konumlar?.length ? ilanData.konumlar : [],
        islem_turu: ilanData.islemTuru || 'satin-al',
        sehir: ilanData.sehir,
        ilce: ilanData.ilce || null,
        fiyat_min: ilanData.fiyatMin ? Number(ilanData.fiyatMin) : 0,
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
        iletisim_tercihi: ilanData.iletisimTercihi || 'telefon',
      })
      .select()
      .single()

    if (ilanError) {
      console.error('İlan hatası:', ilanError)
      return res.status(500).json({ hata: 'İlan oluşturulamadı' })
    }

    // İlan başlığını anlamlı şekilde oluştur (mail için)
    let ilanBaslik = 'Talebiniz'
    const yer = ilanData.ilce || ilanData.sehir || ''
    if (ilanData.kategori === 'emlak') {
      const tip = ilanData.emlakTip || 'Emlak'
      ilanBaslik = yer ? `${yer} ${tip} talebi` : `${tip} talebi`
    } else if (ilanData.kategori === 'vasita') {
      const arac = markaStr || 'Araç'
      ilanBaslik = `${arac} talebi`
    } else if (ilanData.kategori) {
      ilanBaslik = yer ? `${yer} ${ilanData.kategori} talebi` : `${ilanData.kategori} talebi`
    }

    // Mail bildirimleri (hata olsa bile kaydı engellemesin)
    try {
      if (!mevcutKullanici) {
        await hosgeldinMaili(temizEmail, ad)
      }
      await ilanOlusturulduMaili(temizEmail, ad, ilanBaslik)
    } catch (mailErr) {
      console.error('Mail gonderim hatasi (kritik degil):', mailErr)
    }

    return res.status(200).json({
      basarili: true,
      ilanId: ilan.id,
      yeniKayit: !mevcutKullanici,
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      } : null,
    })

  } catch (err) {
    console.error('Misafir kayıt hatası:', err)
    return res.status(500).json({ hata: 'Sunucu hatası' })
  }
}
