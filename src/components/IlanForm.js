import React, { useState, useRef, useEffect } from 'react'
import { sehirler, getIlceler } from '../data/sehirler'
import { KATEGORILER } from '../data/kategoriler'
import { VASITA_TREE, getModeller, getVersiyonlar } from '../data/vasita'
import styles from './IlanForm.module.css'

// Bu ana kategorilerde fiziksel ürün/hizmet her şehirden temin edilebilir/yapılabilir
// (kargo, transfer, uzaktan vb.) — bu yüzden konum adımında "Fark etmez" varsayılan gelir.
// 'emlak' kasıtlı olarak listede YOK çünkü konum emlak için işin özüdür.
const KONUM_GEREKMEYEN_KATEGORILER = ['vasita','ikinci-el-sifir-alisveris','is-makineleri','hizmetler','ozel-ders','is-ilanlari','hayvanlar','yedek-parca-aksesuar-donanim-tuning']

const STEPS_GIRIS   = ['Kategori','Nerede Aranıyor?','Fiyat & Özellikler','Açıklama','İletişim','Onay']
const STEPS_MISAFIR = ['Kategori','Nerede Aranıyor?','Fiyat & Özellikler','Açıklama','İletişim','Kişisel Bilgi','Onay']

const emlakTipler   = ['Daire','Villa','Müstakil Ev','Arsa','İşyeri','Depo','Tarla','Yazlık']
const odaSayilari   = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
const emlakOzellikleri = ['Asansör','Otopark','Balkon','Bahçe','Güvenlik','Eşyalı','Site içi','Deniz manzarası']

// --- Emlak Adım 3 alan grupları ---
// ÖNEMLİ: emlak_tip filtre_deger değerleri (örn. "İmarlı Arsa", "Dükkan & Mağaza", "Kuaför & Berber"...)
// veritabanında yüzlerce farklı serbest metin olabilir ve sürekli yenisi eklenebilir — bu yüzden
// grup tespiti ASLA filtre_deger/emlakTip string'ine bakarak yapılmaz. Bunun yerine kategoriler
// tablosundaki SABİT 2. seviye dal id'leri (Konut, İş Yeri, Arsa, Bina, Konut Projeleri, Devre Mülk,
// Turistik Tesis) kullanılır — katYol[1].id bu id'lerden biriyle eşleştirilir. Bu yöntem, emlak_tip
// tarafına kaç yeni alt tip eklenirse eklensin kırılmaz, çünkü 2. seviye dal sayısı sabittir.
const EMLAK_DAL_ID_KONUT = [
  '57e66520-bac4-44be-9b08-c2477e610f2b', // Konut
  'c1000001-0000-0000-0000-000000000001', // Konut Projeleri
  'c1000001-0000-0000-0000-000000000002', // Devre Mülk (tatil amaçlı konut tipi mülk)
]
const EMLAK_DAL_ID_ARAZI = [
  'fefb224e-7438-4f0a-841c-7ac0116ad0f9', // Arsa
]
const EMLAK_DAL_ID_TICARI = [
  '6596198e-99f8-4146-8c48-85afcf925368', // İş Yeri
  'de81a172-30fd-41a0-b930-df8462778c8b', // Bina
  'c1000001-0000-0000-0000-000000000003', // Turistik Tesis (otel/motel/tatil köyü — işletme amaçlı)
]
// katYol içindeki düğümlerden 2. seviye (seviye===2) olanı bulup grubunu döndürür.
// Statik KATEGORILER (kategoriler.js) kullanılıyorsa id'ler farklı olabileceğinden, id eşleşmezse
// ana kategori adı (katYol[0].label === 'Emlak') + emlakTip string fallback'i devreye girer.
function emlakGrubu(katYol, emlakTip) {
  const ikinciSeviye = katYol.find(k => k.seviye === 2) || katYol[1]
  const id = ikinciSeviye?.id
  if (id) {
    if (EMLAK_DAL_ID_ARAZI.includes(id)) return 'arazi'
    if (EMLAK_DAL_ID_TICARI.includes(id)) return 'ticari'
    if (EMLAK_DAL_ID_KONUT.includes(id)) return 'konut'
  }
  // Fallback (id eşleşmediyse — örn. statik KATEGORILER kullanılıyorsa): bilinen geniş anlamlı
  // string parçalarına bak. Bu sadece son çare; asıl doğru yol yukarıdaki id eşleşmesidir.
  const t = (emlakTip || '').toLowerCase()
  if (/arsa|tarla|bağ\s*&\s*bahçe|imarlı|imarsız/.test(t)) return 'arazi'
  if (/işyeri|dükkan|ofis|depo|bina|otel|motel|tesis|fabrika|mağaza/.test(t)) return 'ticari'
  return 'konut'
}
const imarDurumlari = ['İmarlı','İmarsız','Fark etmez']
const tapuDurumlari = ['Müstakil Tapu','Hisseli Tapu','Fark etmez']
const ticariKullanimTipleri = ['Ofis','Mağaza','Depo','Atölye','Fark etmez']
const vasitaMarkalar = ['Audi','BMW','Citroen','Fiat','Ford','Honda','Hyundai','Kia','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo','Diğer']
const yakitTipleri  = ['Benzin','Dizel','LPG','Hibrit','Elektrikli','Fark etmez']
const vitesTipleri  = ['Otomatik','Manuel','Yarı Otomatik','Fark etmez']

// --- Vasıta Adım 3 alan grupları ---
// Aynı mantık: 2. seviye dal id'sine bakılır, alt markalara/tiplere (filtre_deger) göre DEĞİL —
// çünkü o seviyede yüzlerce marka/tip var ve sürekli yenisi ekleniyor.
const VASITA_DAL_ID_DENIZ = ['446a686e-bd97-4a70-9150-34295264cfa5']  // Deniz Araçları
const VASITA_DAL_ID_HAVA  = ['e185d31a-a09e-4f8b-9391-0404b94e4cfc']  // Hava Araçları
const VASITA_DAL_ID_YEDEK_PARCA = ['d4712154-264d-48a9-9aa1-b1e0cddc6f48']  // Yedek Parça & Aksesuar
// Karavan, Elektrikli, Klasik, Kiralık, ATV, UTV, Engelli Plakalı, Otomobil, Arazi&SUV, Motosiklet,
// Minivan, Ticari → hepsi "standart" grupta kalır (motor+vites+km mantığı hâlâ geçerli).
function vasitaGrubu(katYol) {
  const ikinciSeviye = katYol.find(k => k.seviye === 2) || katYol[1]
  const id = ikinciSeviye?.id
  if (id) {
    if (VASITA_DAL_ID_DENIZ.includes(id)) return 'deniz'
    if (VASITA_DAL_ID_HAVA.includes(id)) return 'hava'
    if (VASITA_DAL_ID_YEDEK_PARCA.includes(id)) return 'yedek-parca'
  }
  // Fallback: id eşleşmezse (statik KATEGORILER kullanılıyorsa) label'a bak.
  const ikinciLabel = (ikinciSeviye?.label || '').toLowerCase()
  if (ikinciLabel.includes('deniz')) return 'deniz'
  if (ikinciLabel.includes('hava')) return 'hava'
  if (ikinciLabel.includes('yedek parça') || ikinciLabel.includes('aksesuar')) return 'yedek-parca'
  return 'standart'
}

// --- İkinci El ve Sıfır Alışveriş Adım 3 alanları ---
// Bu kategoride 23 alt-dal (Bilgisayar, Giyim, Kitap, Cep Telefonu...) var ama hepsi aynı türde
// (fiziksel ürün) — Emlak/Vasıta'daki gibi ölçü birimi farkı yok, bu yüzden id-bazlı çoklu grup yerine
// TEK ortak alan seti (Durum + Marka/Model) kullanılır. Sadece Giyim & Aksesuar'da ek olarak "Beden"
// alanı gösterilir, çünkü orada gerçekten farklı bir kavram (beden/numara) var.
const ALISVERIS_DURUM = ['Sıfır','İkinci El','Fark etmez']
const ALISVERIS_DAL_ID_GIYIM = ['e365d2e3-1c8d-42da-831b-f58c7d2cd5a8'] // Giyim & Aksesuar
function alisverisGiyimMi(katYol) {
  const ikinciSeviye = katYol.find(k => k.seviye === 2) || katYol[1]
  const id = ikinciSeviye?.id
  if (id) return ALISVERIS_DAL_ID_GIYIM.includes(id)
  return (ikinciSeviye?.label || '').toLowerCase().includes('giyim')
}

// --- İş Makineleri & Sanayi Adım 3 alanları ---
// 4 dal (İş Makineleri, Sanayi, Tarım, Elektrik & Enerji) — Alışveriş'teki gibi tüm dallar aynı
// türde (ekipman/makine), id-bazlı ayrı gruplara gerek yok. Tek ortak alan seti: Durum (zorunlu),
// Marka/Model (opsiyonel), Üretim yılı aralığı (opsiyonel).
const ISMAKINESI_DURUM = ['Sıfır','İkinci El','Fark etmez']

// --- Hayvanlar Adım 3 alan grupları ---
// 2. seviye 10 dal, 2 net grup: ÜRÜN dalları (Aksesuar&Ekipman, Yem&Mama — 3. seviyesi "hangi hayvan
// için" seçimi, kendisi fiziksel ürün) ve CANLI HAYVAN dalları (Evcil/Kümes/Büyükbaş/Küçükbaş/
// Akvaryum/Deniz Canlıları/Sürüngenler/Böcekler — 3. seviyesi doğrudan tür/cins). Canlı hayvanda
// "Durum: Sıfır/İkinci El" anlamsız; bunun yerine Yaş + Cinsiyet kullanılır.
const HAYVAN_DAL_ID_URUN = [
  '10a4ff63-08d2-4fcd-a6a3-c2b4e50debd9', // Aksesuar & Ekipman
  'e96bcdb9-ffaa-484d-9573-277a7ed1619e', // Yem & Mama
]
const HAYVAN_DURUM = ['Sıfır','İkinci El','Fark etmez']
const HAYVAN_YAS = ['Yavru','Genç','Yetişkin','Fark etmez']
const HAYVAN_CINSIYET = ['Erkek','Dişi','Fark etmez']
function hayvanGrubu(katYol) {
  const ikinciSeviye = katYol.find(k => k.seviye === 2) || katYol[1]
  const id = ikinciSeviye?.id
  if (id) return HAYVAN_DAL_ID_URUN.includes(id) ? 'urun' : 'canli'
  // Fallback: id eşleşmezse label'a bak.
  const label = (ikinciSeviye?.label || '').toLowerCase()
  if (label.includes('aksesuar') || label.includes('yem') || label.includes('mama')) return 'urun'
  return 'canli'
}

// --- Hizmetler Adım 3 alanları ---
// 6 dal, hepsi aynı mantıkta: satılık ürün değil, talep edilen bir hizmet/usta. Durum/Marka gibi
// ürün alanları hiç uymuyor. Ortak alanlar: Hizmet yeri + Aciliyet — ikisi de opsiyonel.
const HIZMET_YERI = ['Yerinde','Uzaktan','Fark etmez']
const HIZMET_ACILIYET = ['Acil','Bu hafta','Esnek']

// --- Özel Ders Adım 3 alanları ---
// 16 dal, hepsi aynı mantıkta: eğitim/ders talebi. Zengin ama tamamı opsiyonel alan seti —
// hiçbiri zorunlu değil, sadece talebi netleştirmek için.
const OZELDERS_SEKIL = ['Online','Yüz yüze','Fark etmez']
const OZELDERS_SEVIYE = ['İlkokul','Ortaokul','Lise','Üniversite','Yetişkin','Fark etmez']
const OZELDERS_SIKLIK = ['Haftada 1','Haftada 2-3','Yoğun (her gün)','Tek seferlik']
const OZELDERS_YER = ['Öğretmenin yerinde','Öğrencinin evinde','Fark etmez']
const OZELDERS_SURE = ['30 dk','45 dk','60 dk','90 dk','Fark etmez']
const OZELDERS_DENEYIM = ['Yeni başlayan','Deneyimli (3+ yıl)','Uzman / Akademisyen','Fark etmez']
const OZELDERS_GRUP = ['Bireysel','Küçük grup (2-5 kişi)','Fark etmez']

// --- İş İlanları Adım 3 alanları ---
// 26 dal, hepsi aynı mantıkta: meslek/sektör — alıcı burada iş arayan kişi, "Bütçe" alanı
// "Maaş beklentisi" olarak gösterilir (ayrı render). Ek alanlar hepsi opsiyonel.
const ISILANLARI_CALISMA_SEKLI = ['Tam zamanlı','Yarı zamanlı','Uzaktan','Hibrit','Fark etmez']
const ISILANLARI_DENEYIM = ['Yeni başlayan','1-3 yıl','3-5 yıl','5+ yıl','Fark etmez']
const ISILANLARI_SOZLESME = ['Kadrolu','Sözleşmeli','Freelance','Stajyer','Fark etmez']
const ISILANLARI_EGITIM = ['Lise','Ön Lisans','Lisans','Yüksek Lisans','Fark etmez']
const ISILANLARI_SEYAHAT = ['Yok','Şehir içi','Şehir dışı','Yurt dışı','Fark etmez']

// --- Yedek Parça, Aksesuar, Donanım & Tuning Adım 3 alanları ---
// 3 dal (Otomotiv, Motosiklet, Deniz Aracı Ekipmanları), hepsi aynı mantıkta: araç parçası/aksesuar
// satışı — Alışveriş'teki gibi fiziksel ürün. Zengin ama tamamı opsiyonel alan seti.
const YEDEKPARCA_DURUM = ['Sıfır','İkinci El','Fark etmez']
const YEDEKPARCA_TUR = ['Orijinal (OEM)','Yan Sanayi','Fark etmez']
const YEDEKPARCA_KATEGORI = ['Motor & Mekanik','Elektrik & Elektronik','Kaporta & Dış Aksam','İç Donanım','Jant & Lastik','Ses & Görüntü','Aksesuar & Tuning','Bakım & Sarf Malzemesi','Fark etmez']

const EMLAK_KIRA_FIYATLAR  = [5000,8000,10000,12000,15000,18000,20000,22000,25000,28000,30000,35000,40000,45000,50000,60000,75000,100000]
const EMLAK_SATIS_FIYATLAR = [500000,750000,1000000,1250000,1500000,1750000,2000000,2500000,3000000,3500000,4000000,5000000,6000000,7500000,10000000,15000000,20000000,25000000]
const VASITA_FIYATLAR      = [100000,150000,200000,250000,300000,350000,400000,450000,500000,600000,700000,800000,900000,1000000,1250000,1500000,1750000,2000000,2500000,3000000]
const GENEL_FIYATLAR       = [1000,2000,5000,10000,15000,20000,30000,50000,75000,100000,150000,200000,300000,500000]
const BASLANGIC_YIL = 2009
const BITIS_YIL = new Date().getFullYear()
const YIL_SECENEKLER = Array.from({length: BITIS_YIL - BASLANGIC_YIL + 1}, (_,i) => BASLANGIC_YIL + i)

function validate(step, data, giris) {
  switch(step) {
    case 1: return !!data.kategori
    case 2: return data.tumTurkiye || (data.konumlar && data.konumlar.length > 0) || !!data.sehir
    case 3: {
      // Bütçe: en az 0 sabit, en fazla zorunlu
      if (!data.fiyatMax) return false
      if (Number(data.fiyatMax) <= 0) return false
      if (data.kategori === 'emlak') {
        if (!data.emlakTip) return false
        if (!data.m2Min) return false
        if (data.emlakGrubu === 'konut' && data.oda.length === 0) return false
      }
      if (data.kategori === 'vasita') {
        if (data.vasitaGrubu !== 'yedek-parca') {
          if (!data.yilMin || !data.yilMax) return false
        }
      }
      if (data.kategori === 'ikinci-el-sifir-alisveris') {
        if (!data.alisverisDurum) return false
      }
      if (data.kategori === 'is-makineleri') {
        if (!data.ismakinesiDurum) return false
      }
      if (data.kategori === 'hayvanlar' && data.hayvanGrubu === 'urun') {
        if (!data.hayvanDurum) return false
      }
      return true
    }
    case 4: return data.aciklama.trim().length >= 10 && aciklamaSorunlari(data.aciklama).length === 0
    case 5: return !!data.iletisimTercihi
    case 6: {
      if (giris) return true
      const yasaklar = ['sik','orospu','piç','pic','göt','got','amk','bok','oç','oc','salak','aptal','ibne','kahpe','siktir','amına','gerize']
      const adTemiz = data.ad && data.ad.trim().length >= 2 && !yasaklar.some(k => data.ad.toLowerCase().includes(k))
      const soyadTemiz = data.soyad && data.soyad.trim().length >= 2 && !yasaklar.some(k => data.soyad.toLowerCase().includes(k))
      return !!(
        adTemiz && soyadTemiz &&
        data.email && data.email.includes('@') && data.email.includes('.') &&
        data.telefon && data.telefon.replace(/[^0-9]/g,'').length >= 10 &&
        data.sifre && data.sifre.length >= 6 &&
        data.sifre === data.sifre2 &&
        data.kodDogrulandi
      )
    }
    default: return true
  }
}

// =====================================================
// ADIM 6 MİSAFİR — Kompakt, kaydırmasız, mobil uyumlu
// =====================================================
function telefonFormatla(val) {
  const sadece = val.replace(/[^0-9]/g, '').replace(/^0/, '').slice(0, 10)
  const p = [sadece.slice(0,3), sadece.slice(3,6), sadece.slice(6,8), sadece.slice(8,10)]
  return p.filter(Boolean).join(' ')
}

const YASAK_KELIMELER = [
  'sik','orospu','piç','pic','göt','got','amk','bok','oç','oc',
  'salak','aptal','gerizekalı','gerizekal','mal ','kahpe','sürtük',
  'siktir','amına','amina','oğlum','oğlu','ibne','bok','bok',
]

function adFormatla(deger) {
  if (!deger) return deger
  return deger.toLocaleLowerCase('tr-TR').replace(/(^|[\s-])\p{L}/gu, h => h.toLocaleUpperCase('tr-TR'))
}

function tekrarliKarakterVar(deger) {
  return /(.)\1\1/.test((deger||'').toLowerCase())
}

// ===== Açıklama (Adım 4) canlı denetimi =====

function aciklamaKufurVarMi(deger) {
  const kucuk = (deger || '').toLowerCase()
  return YASAK_KELIMELER.some(k => kucuk.includes(k))
}

function aciklamaTelefonVarMi(deger) {
  const metin = deger || ''
  // Telefon benzeri grupları yakala: opsiyonel (+90 veya 0) öneki ardından 3-3-2-2 hane,
  // ayraçlı (boşluk/tire/nokta) ya da bitişik olabilir. Örn: "0532 123 45 67", "05321234567",
  // "+90 532 123 45 67", "0532-123-4567", ya da öneksiz düz "5321234567".
  const grupluRegex = /(\+90[\s.-]?|0)?\d{3}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/g
  const adaylar = metin.match(grupluRegex) || []
  for (const a of adaylar) {
    const rakamlar = a.replace(/[^\d]/g, '')
    // Türkiye'de cep telefonu numaraları her zaman 5 ile başlar (yerel kısım).
    // Bu yüzden önek hariç tutulduğunda kalan 10 hanelik yerel kısmın
    // ilk hanesi 5 olmalı — böylece bütçe/yıl/km gibi rastgele 10 haneli
    // sayılar yanlış pozitif vermez, ama gerçek GSM numaraları (öneksiz dahil) yakalanır.
    if (rakamlar.length === 10 && rakamlar.startsWith('5')) return true
    if (rakamlar.length === 11 && rakamlar.startsWith('05')) return true
    if (rakamlar.length === 12 && rakamlar.startsWith('905')) return true
  }
  return false
}

function aciklamaSacmaMi(deger) {
  const metin = (deger || '').trim()
  if (metin.length < 10) return false
  // Boşlukları çıkardığımızda tüm metin tek bir karakterin tekrarından mı ibaret?
  const bosluksuz = metin.replace(/\s/g, '')
  if (bosluksuz.length >= 6 && /^(.)\1+$/.test(bosluksuz.toLowerCase())) return true
  // Aynı 2-3 karakterlik öbeğin metnin tamamını oluşturacak şekilde tekrarı (ör. "asdasdasdasd")
  if (bosluksuz.length >= 9) {
    for (const uzunluk of [2, 3]) {
      const obek = bosluksuz.slice(0, uzunluk).toLowerCase()
      const tekrar = obek.repeat(Math.ceil(bosluksuz.length / uzunluk)).slice(0, bosluksuz.length)
      if (tekrar === bosluksuz.toLowerCase()) return true
    }
  }
  return false
}

function aciklamaSorunlari(deger) {
  const sorunlar = []
  if (aciklamaTelefonVarMi(deger)) sorunlar.push({ kod:'telefon', mesaj:'📵 Telefon numarası paylaşamazsınız — iletişim bilgisi platform üzerinden güvenli şekilde sağlanır.' })
  if (aciklamaKufurVarMi(deger)) sorunlar.push({ kod:'kufur', mesaj:'⚠️ Açıklamanızda uygunsuz bir ifade tespit edildi, lütfen düzenleyin.' })
  if (aciklamaSacmaMi(deger)) sorunlar.push({ kod:'sacma', mesaj:'⚠️ Açıklamanız anlamlı görünmüyor, lütfen ne aradığınızı yazın.' })
  return sorunlar
}

const YAYGIN_MAIL_SAGLAYICILAR = [
  'gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com',
  'msn.com','live.com','yandex.com','hotmail.com.tr','outlook.com.tr',
  'mail.com','protonmail.com','gmx.com',
]

function emailFormatGecerliMi(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')
}

function emailYayginMi(email) {
  if (!email || !email.includes('@')) return true
  const alan = email.split('@')[1]?.toLocaleLowerCase('tr-TR').trim()
  return YAYGIN_MAIL_SAGLAYICILAR.includes(alan)
}

function adKontrol(ad) {
  if (!ad || ad.trim().length < 2) return false
  const kucuk = ad.toLowerCase()
  if (YASAK_KELIMELER.some(k => kucuk.includes(k))) return false
  if (tekrarliKarakterVar(ad)) return false
  return true
}

function Adim6Misafir({ data, set }) {
  const [robotOnaylandi, setRobotOnaylandi] = React.useState(false)
  const [soru] = React.useState(() => {
    const a = Math.floor(Math.random()*9)+1
    const b = Math.floor(Math.random()*9)+1
    return { a, b, cevap: a + b }
  })
  const [girilenKod, setGirilenKod] = React.useState('')
  const [adHata, setAdHata] = React.useState('')

  React.useEffect(() => { set('kodDogrulandi', robotOnaylandi) }, [robotOnaylandi])

  const sifreGecerli = data.sifre && data.sifre.length >= 6
  const sifreEslesmiyor = data.sifre2 && data.sifre !== data.sifre2
  const sifreEslesiyor = data.sifre2 && data.sifre === data.sifre2 && sifreGecerli

  // Sarı (boş/geçersiz) / Yeşil (dolu) stiller
  function alanStil(dolu, hata) {
    return {
      width:'100%', padding:'9px 12px',
      border:`1.5px solid ${hata ? '#fca5a5' : dolu ? '#86efac' : '#FCD34D'}`,
      borderRadius:9, fontSize:14, fontFamily:'inherit',
      background: hata ? '#fff5f5' : dolu ? '#f0fdf4' : '#FFFBEB',
      outline:'none', boxSizing:'border-box',
    }
  }
  const labelStil = { fontSize:12, fontWeight:600, color:'#374151', marginBottom:4, display:'block' }

  const adDolu = data.ad && data.ad.trim().length >= 2 && adKontrol(data.ad)
  const soyadDolu = data.soyad && data.soyad.trim().length >= 2
  const emailDolu = data.email && data.email.includes('@') && data.email.includes('.')
  const telDolu = data.telefon && data.telefon.replace(/[^0-9]/g,'').length >= 10

  return (
    <div style={{padding:'0 2px'}}>
      <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',gap:10,alignItems:'center'}}>
        <span style={{fontSize:20}}>📬</span>
        <div style={{fontSize:13,color:'#085549',lineHeight:1.4}}>
          <strong>Tekliflerinizi takip edin</strong><br/>
          <span style={{fontSize:12,fontWeight:400}}>Tüm alanlar zorunludur. Bilgileriniz güvende.</span>
        </div>
      </div>

      {/* Ad - Soyad */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
        <div>
          <label style={labelStil}>Adınız *</label>
          <input style={alanStil(adDolu, !!adHata)}
            placeholder="Mehmet" value={data.ad}
            onChange={e => {
              const v = adFormatla(e.target.value)
              set('ad', v)
              if (v && !adKontrol(v)) setAdHata('Geçerli bir ad girin')
              else setAdHata('')
            }} />
          {adHata && <div style={{fontSize:11,color:'#dc2626',marginTop:3}}>{adHata}</div>}
        </div>
        <div>
          <label style={labelStil}>Soyadınız *</label>
          <input style={alanStil(soyadDolu, !!(data.soyad && !adKontrol(data.soyad)))}
            placeholder="Yılmaz" value={data.soyad}
            onChange={e => set('soyad', adFormatla(e.target.value))} />
          {data.soyad && !adKontrol(data.soyad) && (
            <div style={{fontSize:11,color:'#dc2626',marginTop:3}}>Geçerli bir soyad girin</div>
          )}
          {(data.ad?.trim() || data.soyad?.trim()) && adKontrol(data.soyad||'x'.repeat(99)) !== false && (
            <div style={{fontSize:11,color:'#085549',fontWeight:600,marginTop:3}}>Profilde böyle görünecek: {(data.ad?.trim()||'Adınız')} {data.soyad?.trim() ? data.soyad.trim()[0].toLocaleUpperCase('tr-TR')+'.' : ''}</div>
          )}
        </div>
      </div>

      {/* E-posta */}
      <div style={{marginBottom:10}}>
        <label style={labelStil}>E-posta *</label>
        <input style={alanStil(emailDolu, false)}
          type="email" placeholder="ornek@mail.com"
          value={data.email||''} onChange={e=>set('email',e.target.value)} />
        {data.email && !emailFormatGecerliMi(data.email) && (
          <div style={{fontSize:11,color:'#dc2626',marginTop:3}}>Geçerli bir e-posta girin</div>
        )}
        {data.email && emailFormatGecerliMi(data.email) && !emailYayginMi(data.email) && (
          <div style={{fontSize:11,color:'#dc2626',marginTop:3}}>Az kullanılan bir sağlayıcı, doğru yazdığınızdan emin olun</div>
        )}
      </div>

      {/* Telefon */}
      <div style={{marginBottom:10}}>
        <label style={labelStil}>Telefon *</label>
        <div style={{display:'flex'}}>
          <span style={{
            display:'flex',alignItems:'center',padding:'0 10px',
            background: telDolu ? '#f0fdf4' : '#FFFBEB',
            border:`1.5px solid ${telDolu ? '#86efac' : '#FCD34D'}`,
            borderRight:'none',borderRadius:'9px 0 0 9px',
            fontSize:13,color:'#4a5568',fontWeight:500,
          }}>+90</span>
          <input style={{...alanStil(telDolu, false),borderRadius:'0 9px 9px 0',borderLeft:'none'}}
            type="tel" placeholder="5XX XXX XX XX"
            value={data.telefon}
            onChange={e => set('telefon', telefonFormatla(e.target.value))} />
        </div>
      </div>

      {/* Şifre + tekrar */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
        <div>
          <label style={labelStil}>Şifre *
            <span style={{fontWeight:400,color:!data.sifre?'#9ca3af':data.sifre.length<6?'#E53E3E':'#16a34a',fontSize:11,marginLeft:5}}>
              {!data.sifre?'en az 6':data.sifre.length<6?`${data.sifre.length}/6`:'✓'}
            </span>
          </label>
          <input style={alanStil(sifreGecerli, data.sifre && data.sifre.length < 6)}
            type="password" placeholder="••••••"
            value={data.sifre} onChange={e=>set('sifre',e.target.value)} />
        </div>
        <div>
          <label style={labelStil}>Tekrar *</label>
          <input style={alanStil(sifreEslesiyor, sifreEslesmiyor)}
            type="password" placeholder="••••••"
            value={data.sifre2} onChange={e=>set('sifre2',e.target.value)} />
          {sifreEslesmiyor && <div style={{fontSize:11,color:'#dc2626',fontWeight:600,marginTop:3}}>✗ Şifreler uyuşmuyor</div>}
          {sifreEslesiyor && <div style={{fontSize:11,color:'#16a34a',fontWeight:600,marginTop:3}}>✓ Uyuşuyor</div>}
        </div>
      </div>

      {/* Robot doğrulama */}
      <div style={{
        border:`1.5px solid ${robotOnaylandi ? '#86efac' : '#FCD34D'}`,
        borderRadius:10, padding:'12px 14px',
        background: robotOnaylandi ? '#f0fdf4' : '#FFFBEB',
      }}>
        {robotOnaylandi ? (
          <div style={{display:'flex',alignItems:'center',gap:8,color:'#15803d',fontSize:13,fontWeight:600}}>
            <span style={{fontSize:18}}>✅</span> Doğrulama tamamlandı
          </div>
        ) : (
          <>
            <div style={{fontSize:12,fontWeight:600,color:'#92400E',marginBottom:8}}>
              🔢 Robot doğrulaması — Sonucu yazın:
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{
                background:'white',border:'1.5px solid #FCD34D',borderRadius:8,
                padding:'8px 16px',fontSize:16,fontWeight:700,color:'#0f172a',
                letterSpacing:2,flexShrink:0,
              }}>
                {soru.a} + {soru.b} = ?
              </div>
              <input
                style={{
                  flex:1,padding:'8px 12px',border:'1.5px solid #FCD34D',
                  borderRadius:8,fontSize:16,fontWeight:700,
                  textAlign:'center',fontFamily:'inherit',
                  background:'#FFFBEB',outline:'none',maxWidth:80,
                }}
                type="tel" maxLength={2} placeholder="?"
                value={girilenKod}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g,'')
                  setGirilenKod(val)
                  if (val && Number(val) === soru.cevap) setRobotOnaylandi(true)
                }}
              />
            </div>
            {girilenKod && Number(girilenKod) !== soru.cevap && (
              <div style={{fontSize:11,color:'#dc2626',marginTop:6}}>Yanlış cevap, tekrar deneyin</div>
            )}
          </>
        )}
      </div>

      <div style={{fontSize:11,color:'#9ca3af',marginTop:8}}>
        🔒 Kaydolarak <span style={{color:'#0D7A6B'}}>Kullanım Koşulları</span>nı kabul etmiş olursunuz.
      </div>
    </div>
  )
}


function OdaSecici({ oda, toggle }) {
  const secenekler = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
  const doluMu = oda.length > 0
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:8,
      background: doluMu ? '#DCFCE7' : '#FEF3C7',
      border: `2px solid ${doluMu ? '#4ADE80' : '#FCD34D'}`,
      borderRadius:12, padding:'12px',
      transition:'background 0.25s, border-color 0.25s',
    }}>
      {secenekler.map(o => {
        const secili = oda.includes(o)
        return (
          <button key={o} type="button"
            onClick={() => toggle(o)}
            style={{
              padding:'7px 16px', borderRadius:20,
              cursor:'pointer', fontSize:13, fontWeight:600,
              fontFamily:'inherit', transition:'all 0.15s',
              outline:'none', border:'none',
              background: secili ? '#0D7A6B' : 'rgba(255,255,255,0.85)',
              color: secili ? 'white' : '#92400E',
              boxShadow: secili ? 'none' : '0 0 0 1.5px #FCD34D',
            }}>{o}</button>
        )
      })}
    </div>
  )
}

// Tek seçimli zorunlu chip grubu — OdaSecici ile aynı görsel kalıp (sarı=boş/zorunlu, yeşil=dolu),
// ama tek seçim (radio benzeri) davranışı için. Emlak/Arsa'daki İmar/Tapu durumu gibi tekil
// "durum" alanlarında da kullanılabilir.
function TekSecimChipGrubu({ secenekler, secili, onSec }) {
  const doluMu = !!secili
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:8,
      background: doluMu ? '#DCFCE7' : '#FEF3C7',
      border: `2px solid ${doluMu ? '#4ADE80' : '#FCD34D'}`,
      borderRadius:12, padding:'12px',
      transition:'background 0.25s, border-color 0.25s',
    }}>
      {secenekler.map(o => {
        const sec = secili === o
        return (
          <button key={o} type="button"
            onClick={() => onSec(o)}
            style={{
              padding:'7px 16px', borderRadius:20,
              cursor:'pointer', fontSize:13, fontWeight:600,
              fontFamily:'inherit', transition:'all 0.15s',
              outline:'none', border:'none',
              background: sec ? '#0D7A6B' : 'rgba(255,255,255,0.85)',
              color: sec ? 'white' : '#92400E',
              boxShadow: sec ? 'none' : '0 0 0 1.5px #FCD34D',
            }}>{o}</button>
        )
      })}
    </div>
  )
}


// =====================================================
// KATEGORİYE GÖRE DİNAMİK AÇIKLAMA BİLEŞENİ
// =====================================================

const ACIKLAMA_ORNEKLER = {
  'emlak/konut-satilik':          'Örn: Babam için bakımlı, asansörlü, 3+1 daire arıyorum. Okul ve pazar yerine yakın olmasını istiyoruz. Otopark şart.',
  'emlak/konut-kiralik':          'Örn: Eşimle taşınacağız, Şubat başında hazır olması lazım. Balkon ve beyaz eşya tercihimiz. Evcil hayvanımız var.',
  'emlak/konut-turistik-kiralik': 'Örn: Temmuz ayının ilk haftası için 4 kişilik tatil yeri arıyorum. Denize yürüme mesafesinde, klimalı olsun.',
  'emlak/konut-devren-satilik':   'Örn: Kiracısıyla devren satılık daire arıyorum. Merkezi konumda, 5-7 yıllık bina tercihim.',
  'emlak/isyeri-satilik':         'Örn: Muhasebe ofisi için yüksek katlı, asansörlü, 50-80 m2 ofis arıyorum. Merkezi iş bölgesinde olsun.',
  'emlak/isyeri-kiralik':         'Örn: Butik kafe açmak istiyorum. Yoğun yaya trafiği olan, vitrinli, en az 60 m2 yer arıyorum.',
  'emlak/isyeri-devren-satilik':  'Örn: Hazır müşteri portföyü olan, aktif çalışan kafe veya restoran devren arıyorum. Bütçem esnek.',
  'emlak/isyeri-devren-kiralik':  'Örn: Güzellik salonu için uygun, hazır donanımlı, merkezi konumda devren kiralık yer arıyorum.',
  'emlak/arsa-satilik':           'Örn: Villa yapmak için imarlı, köşe arsa arıyorum. İzmir veya Muğla civarı olabilir. Manzaralı tercih ederim.',
  'emlak/arsa-kiralik':           'Örn: Tarımsal üretim için uzun dönem kiralık tarla arıyorum. Sulama imkânı olsun, yol bağlantısı şart.',
  'emlak/arsa-kat-karsiligi':     'Örn: Müteahhite kat karşılığı verebileceğim, imarlı arsa veya bina arıyorum. Daire payı almak istiyorum.',
  'emlak/bina-satilik':           'Örn: Butik otel veya apart pansiyon olarak kullanabileceğim, 8-15 daireli bina arıyorum. Turistik bölge olsun.',
  'emlak/bina-kiralik':           'Örn: Şirketimiz için komple bina kiralamak istiyorum. 200-500 m2 kapalı alan, merkezi konumda olsun.',
  'emlak/emlak-devre-mulk':       'Örn: Yaz tatilleri için kullanmak üzere sahile yakın devre mülk arıyorum. Temmuz-Ağustos haftaları öncelikli.',
  'emlak/emlak-turistik-tesis':   'Örn: İşletmek için küçük butik otel veya pansiyon arıyorum. Turistik bölgede, 10-20 odalı olsun.',
  'emlak/emlak-konut-projeleri':  'Örn: Yatırım amaçlı, sıfır proje daire arıyorum. Teslim tarihi 2025-2026 arası olsun. Taksit imkânı şart.',
  'vasita/otomobil':              'Örn: Aile arabası olarak kullanacağım, çocuklu ailem için geniş bagajlı, az yakıt tüketen otomatik arıyorum.',
  'vasita/arazi-suv':             'Örn: Hafta sonları dağa çıkmak için 4x4 çekişli, sağlam SUV arıyorum. Kışlık lastik takılı olsun.',
  'vasita/motosiklet':            'Örn: Şehir içi ulaşım için yakıt tasarruflu, trafikte manevralı, 125-250 cc motosiklet arıyorum.',
  'vasita/minivan':               'Örn: 7 kişilik aile seyahatleri için, geniş iç hacimli, bagajlı minivan arıyorum. Otomatik tercih ederim.',
  'vasita/ticari':                'Örn: Nakliye işleri için kapalı kasa, 1 tonluk hafif ticari araç arıyorum. Mümkünse 100.000 km altı olsun.',
  'ikinci-el-sifir-alisveris/bilgisayar':         'Örn: Grafik tasarım için yüksek ekran kartlı, en az 32GB RAM, hızlı SSDli laptop veya masaüstü arıyorum.',
  'ikinci-el-sifir-alisveris/cep-telefonu-aksesuar': 'Örn: Fotoğraf çekmek için iyi kameralı, en az 128GB hafızalı, pil ömrü uzun akıllı telefon arıyorum.',
  'ikinci-el-sifir-alisveris/elektrikli-ev-aletleri': 'Örn: Mutfağım için buharlı, çift hazneli, akıllı buz dolabı arıyorum. Siyah renk tercihim var.',
  'ikinci-el-sifir-alisveris/ev-dekorasyon':      'Örn: Oturma odam için modern, L şeklinde, koyu gri köşe koltuk takımı arıyorum. Sökülebilir kılıflı olsun.',
  'ikinci-el-sifir-alisveris/hobi-oyuncak':       'Örn: Fotoğraf hobim için tam frame, en az 24MP, ikinci el DSLR veya aynasız fotoğraf makinesi arıyorum.',
  'ikinci-el-sifir-alisveris/spor':               'Örn: Evde kullanmak için katlanabilir, sessiz motorlu koşu bandı arıyorum. Eğim ayarlı olsun.',
  'ikinci-el-sifir-alisveris/giyim-aksesuar':     'Örn: Kışlık, M beden, koyu renk yünlü kaban arıyorum. Marka önemli değil, kaliteli kumaş olsun.',
  'is-makineleri/is-makineleri-alt': 'Örn: Küçük inşaat projem için günlük veya haftalık kiralık mini ekskavatör arıyorum. Operatörlü olabilir.',
  'is-makineleri/sanayi':         'Örn: Atölyem için ikinci el CNC torna tezgahı arıyorum. 2010 sonrası, çalışır durumda olsun.',
  'is-makineleri/tarim':          'Örn: 50 dönüm tarlamı sürmek için ikinci el traktör arıyorum. Pulluğuyla birlikte satılsın.',
  'is-makineleri/ime-elektrik-enerji': 'Örn: Çiftliğim için yedek elektrik kaynağı olarak 10 kVA dizel jeneratör arıyorum. Sessiz çalışan tercih ederim.',
  'hayvanlar/hayvan-evcil-hayvanlar':   'Örn: Kızım için sakin, sosyal, tüy dökmez bir köpek arıyorum. Tercihen aşıları tam ve kısırlaştırılmış olsun.',
  'hayvanlar/hayvan-kucukbas-hayvanlar': 'Örn: Çiftliğim için 10-15 baş merinos koyun arıyorum. Damızlık, sağlıklı, belgeli olsun.',
  'hayvanlar/hayvan-kumes-hayvanlari':   'Örn: Organik yumurta üretimi için 50-100 adet yumurtlayan tavuk veya civciv arıyorum.',
  'hayvanlar/hayvan-buyukbas-hayvanlar': 'Örn: Çiftliğim için sağmal, sağlıklı, genç bir inek arıyorum. Aşıları yapılmış olsun.',
  'hayvanlar/hayvan-akvaryum-baliklari': 'Örn: 100 litrelik akvaryumum için renkli, sürü halinde yaşayan, bakımı kolay tropikal balıklar arıyorum.',
  'hayvanlar/hayvan-aksesuar-ekipman':   'Örn: Orta boy köpeğim için sağlam, kolay temizlenen, taşınabilir mama kabı arıyorum.',
  'hayvanlar/hayvan-yem-mama':           'Örn: Hassas mide problemi olan kedim için tahılsız, kuzu etli premium kuru mama arıyorum.',
  'yedek-parca-aksesuar-donanim-tuning':                  'Örn: 2018 model Honda Civic için orijinal sağ ön tampon ve far arıyorum. Boyasız, kazasız olsun.',
  'yedek-parca-aksesuar-donanim-tuning/oto-ekip-otomotiv-ekipmanlari': 'Örn: 2018 model Honda Civic için orijinal sağ ön tampon ve far arıyorum. Boyasız, kazasız olsun.',
  'yedek-parca-aksesuar-donanim-tuning/motosiklet-ekipmanlari': 'Örn: Yamaha MT-07 için orijinal egzoz sistemi arıyorum. Krom kaplama, ses tonu iyi olsun.',
  'yedek-parca-aksesuar-donanim-tuning/deniz-araci-ekipmanlari': 'Örn: 25 ayak motoryatım için yedek deniz motoru pervanesi arıyorum. Orijinal, paslanmaz çelik olsun.',
  'hizmetler':                    'Örn: Dairem için güvenilir, referanslı, sigortalı boyacı ustası arıyorum. 3+1, beyaz renk, 3 günde teslim.',
  'ozel-ders':                    'Örn: Lise 3. sınıf öğrencim için hafta içi akşamları online matematik ve fizik öğretmeni arıyorum.',
  'is-ilanlari':                  'Örn: E-ticaret firmamız için tecrübeli, sosyal medya yönetimi ve içerik üretimi yapabilecek uzaktan çalışan arıyorum.',
  'default':                      'Örn: Bütçemi, beklentilerimi ve özel isteklerimi buraya yazıyorum. Ne kadar detay, o kadar doğru teklif.',
}

function getAciklamaOrnek(katYol, data) {
  if (!katYol || katYol.length === 0) return ACIKLAMA_ORNEKLER['default']

  const ana = katYol[0]?.slug || ''
  const alt = katYol[1]?.slug || ''
  const ucuncu = katYol[2]?.slug || ''

  const key3 = `${ana}/${alt}/${ucuncu}`
  if (ACIKLAMA_ORNEKLER[key3]) return ACIKLAMA_ORNEKLER[key3]

  const key2 = `${ana}/${alt}`
  if (ACIKLAMA_ORNEKLER[key2]) return ACIKLAMA_ORNEKLER[key2]

  const key1 = ana
  if (ACIKLAMA_ORNEKLER[key1]) return ACIKLAMA_ORNEKLER[key1]

  return ACIKLAMA_ORNEKLER['default']
}

function AciklamaAdimi({ data, set, katYol }) {
  const placeholder = getAciklamaOrnek(katYol, data)
  const uzunluk = data.aciklama.trim().length
  const yeterli = uzunluk >= 10
  const sorunlar = aciklamaSorunlari(data.aciklama)

  return (
    <div>
      {/* Seçilen kategori özeti */}
      {katYol.length > 0 && (
        <div style={{background:'#F0F9FF',border:'1px solid #BAE6FD',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:18}}>{katYol[0]?.icon || '📋'}</span>
          <div>
            <div style={{fontSize:11,color:'#0369A1',fontWeight:600}}>Açıklama ipucu — seçiminize özel</div>
            <div style={{fontSize:12,color:'#0C4A6E'}}>{katYol.map(k=>k.label).join(' › ')}</div>
          </div>
        </div>
      )}

      {sorunlar.length > 0 && (
        <div style={{background:'#FEF2F2',border:'1.5px solid #fca5a5',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',flexDirection:'column',gap:6}}>
          {sorunlar.map(s => (
            <div key={s.kod} style={{fontSize:12.5,color:'#B91C1C',fontWeight:600,lineHeight:1.5}}>{s.mesaj}</div>
          ))}
        </div>
      )}

      <div style={{position:'relative'}}>
        <label className="form-label" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>Açıklama</span>
          <span style={{fontWeight:400,color:yeterli?'#38A169':'#E53E3E',fontSize:11}}>
            {uzunluk}/10 min{yeterli?' ✓':''}
          </span>
        </label>
        <textarea
          className="form-input"
          rows={5}
          placeholder={placeholder}
          style={{resize:'vertical',lineHeight:1.7,fontSize:14,
            borderColor: sorunlar.length > 0 ? '#fca5a5' : undefined,
          }}
          value={data.aciklama}
          onChange={e=>set('aciklama',e.target.value)}
        />
      </div>

      {/* İpuçları */}
      <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:5}}>
        {[
          katYol[0]?.slug === 'emlak'      && '🏠 Taşınma tarihinizi belirtin',
          katYol[0]?.slug === 'emlak'      && '📐 İstediğiniz özellikleri yazın (asansör, otopark...)',
          katYol[0]?.slug === 'vasita'     && '🔑 Renk, donanım paketini belirtin',
          katYol[0]?.slug === 'vasita'     && '🛣️ Maksimum km sınırınızı yazın',
          katYol[0]?.slug === 'ikinci-el-sifir-alisveris'  && '📦 Marka veya model tercihiniz varsa belirtin',
          katYol[0]?.slug === 'hizmetler'  && '📅 İş için uygun gün/saatlerinizi yazın',
          katYol[0]?.slug === 'ozel-ders'  && '📚 Hangi konularda destek istediğinizi belirtin',
          !katYol[0]?.slug                 && '✍️ Ne kadar detay verirseniz o kadar iyi teklif alırsınız',
        ].filter(Boolean).slice(0,2).map((ipucu, i) => (
          <div key={i} style={{fontSize:12,color:'#8a95a3',display:'flex',alignItems:'center',gap:5}}>
            {ipucu}
          </div>
        ))}
      </div>
    </div>
  )
}


export default function IlanForm({ open, onClose, onSubmit, user, kategoriAgaci, duzenlenecekIlan }) {
  const giris = !!user
  const STEPS = giris ? STEPS_GIRIS : STEPS_MISAFIR
  const TOPLAM = STEPS.length
  const KATLAR = (kategoriAgaci && kategoriAgaci.length) ? kategoriAgaci : KATEGORILER
  const bodyRef = useRef(null)
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [katYol, setKatYol] = useState([])
  const [konumlar, setKonumlar] = useState([])
  const [data, setData] = useState({
    kategori:'', altKategori:'', altKategori2:'', kategoriYol:[], enAltKategori:'', enAltLabel:'',
    islemTuru:'satin-al', sehir:'', ilce:'', konumlar:[], tumTurkiye:false,
    fiyatMin:'0', fiyatMax:'',
    emlakTip:'', emlakGrubu:'konut', m2Min:'', m2Max:'', oda:[], tercihler:[],
    vasitaAltTip:'', vasitaMarka:'', vasitaModel:'', vasitaVersiyon:'', vasitaGrubu:'standart',
    markalar:[], yilMin:'', yilMax:String(new Date().getFullYear()), kmMax:'', yakit:[], vites:[],
    uzunlukMin:'', uzunlukMax:'', motorGucu:'', ucusSaatiMax:'', uyumluParca:'',
    alisverisDurum:'', alisverisMarka:'', alisverisBeden:'',
    ismakinesiDurum:'', ismakinesiMarka:'', ismakinesiYilMin:'', ismakinesiYilMax:'',
    hayvanGrubu:'canli', hayvanDurum:'', hayvanMarka:'', hayvanYas:'', hayvanCinsiyet:'',
    hizmetYeri:'', hizmetAciliyet:'',
    ozeldersSekil:'', ozeldersSeviye:'', ozeldersSiklik:'', ozeldersYer:'', ozeldersSure:'', ozeldersDeneyim:'', ozeldersGrup:'',
    isilanlariCalismaSekli:'', isilanlariDeneyim:'', isilanlariSozlesme:'', isilanlariEgitim:'', isilanlariSeyahat:'',
    ypDurum:'', ypTur:'', ypMarka:'', ypUyumluArac:'', ypUyumluYilMin:'', ypUyumluYilMax:'', ypKategori:'',
    aciklama:'', iletisimTercihi:'telefon', ad:'', soyad:'', email:'', telefon:'', sifre:'', sifre2:'', dogrulamaKodu:'', kodGonderildi:false, kodDogrulandi:false,
  })

  const set = (k,v) => setData(d => ({...d,[k]:v}))
  const toggle = (k,v) => setData(d => ({...d,[k]: d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]}))

  const aktifKatListesi = katYol.length === 0
    ? KATLAR
    : (katYol[katYol.length - 1].altKategoriler || [])

  function kategoriYazByol(yol) {
    set('kategori', yol[0]?.slug || '')
    set('altKategori', yol[1]?.slug || '')
    set('altKategori2', yol[2]?.slug || '')
    // Tam yol (baslik icin) + en alt secilen kategori
    set('kategoriYol', yol.map(k => ({ slug: k.slug || '', label: k.label || '' })))
    set('enAltKategori', yol.length > 0 ? (yol[yol.length-1].slug || '') : '')
    set('enAltLabel', yol.length > 0 ? (yol[yol.length-1].label || '') : '')
    const son = yol[yol.length - 1]

    // İşlem türünü kategori adından otomatik belirle
    const tumMetin = yol.map(k => (k.slug||'') + ' ' + (k.label||'')).join(' ').toLowerCase()
    if (tumMetin.includes('kiralik') || tumMetin.includes('kiralık') || tumMetin.includes('turistik')) {
      set('islemTuru', 'kirala')
    } else if (tumMetin.includes('satilik') || tumMetin.includes('satılık') || tumMetin.includes('devren')) {
      set('islemTuru', 'satin-al')
    }

    if (yol[0]?.slug === 'vasita') {
      const yeniVasitaGrubu = vasitaGrubu(yol)
      if (data.vasitaGrubu && data.vasitaGrubu !== yeniVasitaGrubu) {
        set('uzunlukMin',''); set('uzunlukMax',''); set('motorGucu',''); set('ucusSaatiMax',''); set('uyumluParca','')
        set('kmMax',''); set('yakit',[]); set('vites',[])
      }
      set('vasitaGrubu', yeniVasitaGrubu)
    }

    if (yol[0]?.slug === 'hayvanlar') {
      const yeniHayvanGrubu = hayvanGrubu(yol)
      if (data.hayvanGrubu && data.hayvanGrubu !== yeniHayvanGrubu) {
        set('hayvanDurum',''); set('hayvanMarka',''); set('hayvanYas',''); set('hayvanCinsiyet','')
      }
      set('hayvanGrubu', yeniHayvanGrubu)
    }

    if (yol[0]?.slug === 'vasita' && yol.length >= 3) {
      const markaParcalar = yol.slice(2).map(k => k.label)
      set('vasitaMarka', markaParcalar[0] || '')
      set('vasitaModel', markaParcalar[1] || '')
      set('markalar', [markaParcalar.join(' ')])
    } else if (son?.filtre_tip === 'marka' && son?.filtre_deger) {
      set('vasitaMarka', son.filtre_deger)
      set('markalar', [son.filtre_deger])
    }

    if (son?.filtre_tip === 'emlak_tip' && son?.filtre_deger) {
      const yeniGrup = emlakGrubu(yol, son.filtre_deger)
      if (data.emlakTip && data.emlakTip !== son.filtre_deger) { set('tercihler', []); set('oda', []) }
      set('emlakTip', son.filtre_deger)
      set('emlakGrubu', yeniGrup)
    } else if (yol[0]?.slug === 'emlak' && yol.length >= 2) {
      const sonLabel = son.label || ''
      const islemKelimeleri = ['satılık','kiralık','devren','turistik','satilik','kiralik']
      if (!islemKelimeleri.some(k => sonLabel.toLowerCase().includes(k))) {
        const yeniGrup = emlakGrubu(yol, sonLabel)
        if (data.emlakTip && data.emlakTip !== sonLabel) { set('tercihler', []); set('oda', []) }
        set('emlakTip', sonLabel)
        set('emlakGrubu', yeniGrup)
      }
    }
  }

  function katSec(k) {
    const cocukVar = k.altKategoriler && k.altKategoriler.length > 0
    const yeniYol = [...katYol, k]
    setKatYol(yeniYol)
    kategoriYazByol(yeniYol)
    if (!cocukVar) {
      const anaKatSlug = yeniYol[0]?.slug || ''
      set('tumTurkiye', KONUM_GEREKMEYEN_KATEGORILER.includes(anaKatSlug))
      setTimeout(() => setStep(2), 350)
    }
  }

  function kategoriOnayla() {
    kategoriYazByol(katYol)
    const anaKatSlug = katYol[0]?.slug || ''
    set('tumTurkiye', KONUM_GEREKMEYEN_KATEGORILER.includes(anaKatSlug))
  }

  // Kategori adımında (Adım 1) bir üst kademeye dön.
  // katYol doluysa son seçimi geri al; katYol boşsa (en üst kademedeyse) false döner,
  // çağıran taraf bu durumda formu kapatmayı/Vazgeç davranışını tetikleyebilir.
  function katGeri() {
    if (katYol.length === 0) return false
    const yeniYol = katYol.slice(0, -1)
    setKatYol(yeniYol)
    kategoriYazByol(yeniYol)
    return true
  }

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0 }, [step])

  // Düzenleme modu: panel formu mevcut bir ilanın verisiyle açtığında (duzenlenecekIlan dolu),
  // form alanları DB satırından prefill edilir. Kategori ağacı, ilanın kendi kategori_yol'undan
  // (jsonb) okunur — yeniden kategori seçim adımına gerek kalmadan doğrudan son adıma atlanır.
  useEffect(() => {
    if (!open || !duzenlenecekIlan) return
    const d = duzenlenecekIlan
    const yol = Array.isArray(d.kategori_yol) && d.kategori_yol.length ? d.kategori_yol : []
    if (yol.length) { setKatYol(yol); kategoriYazByol(yol) }
    const konumlarVar = Array.isArray(d.konumlar) && d.konumlar.length ? d.konumlar : (d.sehir ? [{ sehir: d.sehir, ilce: d.ilce || '' }] : [])
    setKonumlar(konumlarVar)
    setData(prev => ({
      ...prev,
      kategori: d.kategori || '',
      altKategori: d.alt_kategori || '',
      altKategori2: d.alt_kategori2 || '',
      kategoriYol: yol,
      islemTuru: d.islem_turu || prev.islemTuru,
      sehir: d.sehir || '',
      ilce: d.ilce || '',
      konumlar: konumlarVar,
      tumTurkiye: !d.sehir,
      fiyatMin: d.fiyat_min != null ? String(d.fiyat_min) : '0',
      fiyatMax: d.fiyat_max != null ? String(d.fiyat_max) : '',
      m2Min: d.m2_min != null ? String(d.m2_min) : '',
      m2Max: d.m2_max != null ? String(d.m2_max) : '',
      oda: d.oda ? d.oda.split(',').filter(Boolean) : [],
      tercihler: d.tercihler ? d.tercihler.split(',').filter(Boolean) : [],
      emlakTip: d.emlak_tip || '',
      markalar: d.markalar ? d.markalar.split(',').filter(Boolean) : [],
      yilMin: d.yil_min != null ? String(d.yil_min) : '',
      yilMax: d.yil_max != null ? String(d.yil_max) : prev.yilMax,
      kmMax: d.km_max != null ? String(d.km_max) : '',
      yakit: d.yakit ? d.yakit.split(',').filter(Boolean) : [],
      vites: d.vites ? d.vites.split(',').filter(Boolean) : [],
      aciklama: d.aciklama || '',
      iletisimTercihi: d.iletisim_tercihi || 'mesaj',
      ad: user?.ad || '', soyad: user?.soyad || '', email: user?.email || '', telefon: user?.telefon || '',
    }))
    setStep(3) // "Fiyat & Özellikler" adımından başlat — kategori adımları tekrar gösterilmez,
               // kullanıcı buradan ileri/geri ile açıklama/iletişim/onay adımlarına serbestçe gidebilir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duzenlenecekIlan])

  function konumEkle() {
    if (data.tumTurkiye) {
      set('sehir', ''); set('ilce', ''); set('konumlar', [])
      setKonumlar([])
      return
    }
    if (!data.sehir) { alert('Önce şehir seçin'); return }
    const yeni = { sehir: data.sehir, ilce: data.ilce || '' }
    if (konumlar.some(k => k.sehir === yeni.sehir && k.ilce === yeni.ilce)) { alert('Bu konum zaten ekli'); return }
    const yeniListe = [...konumlar, yeni]
    setKonumlar(yeniListe)
    set('konumlar', yeniListe)
    if (yeniListe.length === 1) { set('sehir', yeni.sehir); set('ilce', yeni.ilce) }
    set('ilce', '')
  }
  function konumCikar(i) {
    const yeniListe = konumlar.filter((_, idx) => idx !== i)
    setKonumlar(yeniListe)
    set('konumlar', yeniListe)
    if (yeniListe.length > 0) { set('sehir', yeniListe[0].sehir); set('ilce', yeniListe[0].ilce) }
    else { set('sehir', ''); set('ilce', '') }
  }

  function ileri() { if (!validate(step, data, giris)) return; if (step < TOPLAM) setStep(s => s+1) }
  function geri()  { if (step > 1) setStep(s => s-1) }

  // Adım 1'de kategori kademesi doluysa üst kademeye dön, değilse normal adım geri gitsin.
  // Hem footer Geri butonu hem donanım/tarayıcı geri tuşu bu fonksiyonu kullanır.
  // Dönüş değeri: true = panel içinde bir yere geri gidildi, false = gidecek yer kalmadı (panel kapanmalı).
  function birOncekiAdim() {
    if (step === 1) {
      if (katYol.length > 0) { katGeri(); return true }
      return false
    }
    geri()
    return true
  }

  // birOncekiAdim, onClose her render'da değişebildiği için, ve handlePopstate'in
  // useEffect mount anındaki ESKİ closure'ı kullanmaması için tüm okumalar ref üzerinden yapılır.
  const birOncekiAdimRef = useRef(birOncekiAdim)
  birOncekiAdimRef.current = birOncekiAdim
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Mobil donanım / tarayıcı geri tuşu desteği.
  // Panel açıkken tarayıcı geçmişine PEŞİN PEŞİN birden fazla "guard" girişi ekleniyor
  // (tek tek popstate içinde yeniden eklemek yerine). Bunun sebebi: kullanıcı donanım geri
  // tuşuna çok hızlı art arda basarsa, popstate handler'ı içinde senkron pushState çağırmak
  // bazı mobil tarayıcılarda (özellikle Android Chrome) güvenilir şekilde işlenmeyebiliyor —
  // ikinci basış, henüz "commit" olmamış yeni girişi değil, ondan önceki gerçek sayfayı
  // hedefleyebiliyor. Baştan yeterli sayıda guard eklemek bu yarış durumunu ortadan kaldırır.
  // Panel kapanmadıkça mevcut sayfanın/kategorinin kendi URL state'ine (router.push vb.) dokunulmuyor.
  // Panel programatik olarak (✕ / Vazgeç / Tamam butonlarıyla) kapanırsa, tüketilmemiş guard
  // girişleri cleanup'ta toplu olarak history.go() ile geri alınır.
  const GUARD_SAYISI = 20
  useEffect(() => {
    if (!open || typeof window === 'undefined') return

    let guardAktif = true
    let tuketilenGuard = 0
    for (let i = 0; i < GUARD_SAYISI; i++) {
      window.history.pushState({ ilanFormGuard: true }, '')
    }

    function handlePopstate() {
      if (!guardAktif) return
      tuketilenGuard++
      const devamEtti = birOncekiAdimRef.current()
      if (!devamEtti) {
        // Gidecek yer kalmadı: paneli kapat.
        guardAktif = false
        onCloseRef.current()
      }
      // devamEtti=true ise: panel içinde bir yere gidildi, fazladan pushState YAPILMIYOR —
      // baştan eklenen guard'lardan biri zaten tüketildi, sıradaki geri tuşu için hazırda bekleyen var.
    }

    window.addEventListener('popstate', handlePopstate)
    return () => {
      window.removeEventListener('popstate', handlePopstate)
      // Panel popstate dışında bir yolla (✕ / Vazgeç / Tamam) kapandıysa, tüketilmemiş
      // guard girişleri tarayıcı geçmişinde fazlalık olarak kalmasın diye toplu geri alınır.
      if (guardAktif) {
        const kalanGuard = GUARD_SAYISI - tuketilenGuard
        if (kalanGuard > 0) window.history.go(-kalanGuard)
      }
      guardAktif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSubmit() {
    if (duzenlenecekIlan) {
      // Düzenleme modu: asıl ilan satırı değişmez, yeni veriler onaya gönderilir.
      setYukleniyor(true)
      try {
        const { ilanDuzenlemeOner } = await import('../lib/db')
        const final = {...data, ad:user.ad, soyad:user.soyad, telefon:user.telefon, email:user.email}
        const { error } = await ilanDuzenlemeOner(duzenlenecekIlan.id, final)
        if (error) { alert('Bir hata oluştu: ' + error.message); return }
        setDone(true)
        onSubmit && onSubmit(final)
      } catch (e) {
        alert('Bağlantı hatası, tekrar deneyin')
      } finally {
        setYukleniyor(false)
      }
      return
    }

    if (giris) {
      const final = {...data, ad:user.ad, soyad:user.soyad, telefon:user.telefon, email:user.email}
      onSubmit && onSubmit(final)
      setDone(true)
      return
    }

    // Misafir: sessiz kayıt API'sine gönder
    setYukleniyor(true)
    try {
      const res = await fetch('/api/misafir-kayit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          ad: data.ad,
          soyad: data.soyad,
          email: data.email,
          telefon: data.telefon,
          sifre: data.sifre,
          ilanData: data,
        })
      })
      const sonuc = await res.json()
      if (sonuc.basarili) {
        // Otomatik giriş - Supabase session'ı ayarla
        if (sonuc.session) {
          const { supabase: sb } = await import('../lib/supabase')
          await sb.auth.setSession(sonuc.session)
        }
        setDone(true)
        // onSubmit'i ÇAĞIRMA - API zaten ilana oluşturdu
      } else {
        alert('Bir hata oluştu: ' + (sonuc.hata || 'Bilinmeyen hata'))
      }
    } catch(err) {
      alert('Bağlantı hatası, tekrar deneyin')
    } finally {
      setYukleniyor(false)
    }
  }

  function reset() {
    setStep(1); setDone(false); setKatYol([]); setKonumlar([])
    setData({ kategori:'', altKategori:'', altKategori2:'', kategoriYol:[], enAltKategori:'', enAltLabel:'', islemTuru:'satin-al', sehir:'', ilce:'', konumlar:[], tumTurkiye:false, fiyatMin:'0', fiyatMax:'', emlakTip:'', emlakGrubu:'konut', m2Min:'', m2Max:'', oda:[], tercihler:[], vasitaAltTip:'', vasitaMarka:'', vasitaModel:'', vasitaVersiyon:'', vasitaGrubu:'standart', markalar:[], yilMin:'', yilMax:String(new Date().getFullYear()), kmMax:'', yakit:[], vites:[], uzunlukMin:'', uzunlukMax:'', motorGucu:'', ucusSaatiMax:'', uyumluParca:'', alisverisDurum:'', alisverisMarka:'', alisverisBeden:'', ismakinesiDurum:'', ismakinesiMarka:'', ismakinesiYilMin:'', ismakinesiYilMax:'', hayvanGrubu:'canli', hayvanDurum:'', hayvanMarka:'', hayvanYas:'', hayvanCinsiyet:'', hizmetYeri:'', hizmetAciliyet:'', ozeldersSekil:'', ozeldersSeviye:'', ozeldersSiklik:'', ozeldersYer:'', ozeldersSure:'', ozeldersDeneyim:'', ozeldersGrup:'', isilanlariCalismaSekli:'', isilanlariDeneyim:'', isilanlariSozlesme:'', isilanlariEgitim:'', isilanlariSeyahat:'', ypDurum:'', ypTur:'', ypMarka:'', ypUyumluArac:'', ypUyumluYilMin:'', ypUyumluYilMax:'', ypKategori:'', aciklama:'', iletisimTercihi:'telefon', ad:'', soyad:'', email:'', telefon:'', sifre:'', sifre2:'', dogrulamaKodu:'', kodGonderildi:false, kodDogrulandi:false })
  }

  function getFiyatlar() {
    if (data.kategori === 'emlak') return data.islemTuru === 'kirala' ? EMLAK_KIRA_FIYATLAR : EMLAK_SATIS_FIYATLAR
    if (data.kategori === 'vasita') return VASITA_FIYATLAR
    return GENEL_FIYATLAR
  }

  function ozetSatirlar() {
    const s = []
    if (katYol.length > 0) s.push({l:'Kategori', v: katYol.map(k=>k.label).join(' › ')})
    s.push({l:'İşlem', v: data.islemTuru==='satin-al'?'Satın almak':'Kiralamak'})
    if (konumlar.length > 0) s.push({l:'Konumlar', v: konumlar.map(k => k.sehir + (k.ilce ? ' / ' + k.ilce : '')).join(', ')})
    else if (data.sehir) s.push({l:'Konum', v: data.sehir+(data.ilce?' / '+data.ilce:'')})
    if (data.fiyatMax) s.push({l: data.kategori === 'is-ilanlari' ? 'Maaş beklentisi' : 'Bütçe', v:'₺0 – ₺'+Number(data.fiyatMax).toLocaleString('tr-TR')})
    if (data.kategori==='emlak') {
      if (data.emlakTip) s.push({l:'Tür', v:data.emlakTip})
      if (data.m2Min) s.push({l:'m²', v:data.m2Min+(data.m2Max?' – '+data.m2Max:'+')+ ' m²'})
      if (data.oda.length) s.push({l:'Oda', v:data.oda.join(', ')})
      if (data.tercihler.length) s.push({l: data.emlakGrubu==='konut' ? 'Özellikler' : 'Detaylar', v:data.tercihler.join(', ')})
    }
    if (data.kategori==='vasita') {
      if (data.vasitaMarka) s.push({l:'Araç', v:[data.vasitaMarka,data.vasitaModel].filter(Boolean).join(' ')})
      if (data.yilMin||data.yilMax) s.push({l:'Yıl', v:data.yilMin+' – '+data.yilMax})
      if (data.kmMax) s.push({l:'Max KM', v:Number(data.kmMax).toLocaleString('tr-TR')+' km'})
      if (data.uzunlukMin||data.uzunlukMax) s.push({l:'Uzunluk', v:(data.uzunlukMin||'0')+(data.uzunlukMax?' – '+data.uzunlukMax:'+')+' m'})
      if (data.motorGucu) s.push({l:'Motor gücü', v:data.motorGucu+' HP'})
      if (data.ucusSaatiMax) s.push({l:'Max uçuş saati', v:data.ucusSaatiMax+' saat'})
      if (data.uyumluParca) s.push({l:'Uyumlu', v:data.uyumluParca})
    }
    if (data.kategori==='ikinci-el-sifir-alisveris') {
      if (data.alisverisDurum) s.push({l:'Durum', v:data.alisverisDurum})
      if (data.alisverisMarka) s.push({l:'Marka/Model', v:data.alisverisMarka})
      if (data.alisverisBeden) s.push({l:'Beden/Numara', v:data.alisverisBeden})
    }
    if (data.kategori==='is-makineleri') {
      if (data.ismakinesiDurum) s.push({l:'Durum', v:data.ismakinesiDurum})
      if (data.ismakinesiMarka) s.push({l:'Marka/Model', v:data.ismakinesiMarka})
      if (data.ismakinesiYilMin||data.ismakinesiYilMax) s.push({l:'Üretim yılı', v:(data.ismakinesiYilMin||'?')+' – '+(data.ismakinesiYilMax||'?')})
    }
    if (data.kategori==='hayvanlar') {
      if (data.hayvanDurum) s.push({l:'Durum', v:data.hayvanDurum})
      if (data.hayvanMarka) s.push({l:'Marka/Model', v:data.hayvanMarka})
      if (data.hayvanYas) s.push({l:'Yaş', v:data.hayvanYas})
      if (data.hayvanCinsiyet) s.push({l:'Cinsiyet', v:data.hayvanCinsiyet})
    }
    if (data.kategori==='hizmetler') {
      if (data.hizmetYeri) s.push({l:'Hizmet yeri', v:data.hizmetYeri})
      if (data.hizmetAciliyet) s.push({l:'Aciliyet', v:data.hizmetAciliyet})
    }
    if (data.kategori==='ozel-ders') {
      if (data.ozeldersSekil) s.push({l:'Ders şekli', v:data.ozeldersSekil})
      if (data.ozeldersSeviye) s.push({l:'Öğrenci seviyesi', v:data.ozeldersSeviye})
      if (data.ozeldersSiklik) s.push({l:'Sıklık', v:data.ozeldersSiklik})
      if (data.ozeldersYer) s.push({l:'Ders yeri', v:data.ozeldersYer})
      if (data.ozeldersSure) s.push({l:'Ders süresi', v:data.ozeldersSure})
      if (data.ozeldersDeneyim) s.push({l:'Öğretmen deneyimi', v:data.ozeldersDeneyim})
      if (data.ozeldersGrup) s.push({l:'Birey/Grup', v:data.ozeldersGrup})
    }
    if (data.kategori==='is-ilanlari') {
      if (data.isilanlariCalismaSekli) s.push({l:'Çalışma şekli', v:data.isilanlariCalismaSekli})
      if (data.isilanlariDeneyim) s.push({l:'Deneyim', v:data.isilanlariDeneyim})
      if (data.isilanlariSozlesme) s.push({l:'Sözleşme türü', v:data.isilanlariSozlesme})
      if (data.isilanlariEgitim) s.push({l:'Eğitim seviyesi', v:data.isilanlariEgitim})
      if (data.isilanlariSeyahat) s.push({l:'Seyahat', v:data.isilanlariSeyahat})
    }
    if (data.kategori==='yedek-parca-aksesuar-donanim-tuning') {
      if (data.ypDurum) s.push({l:'Durum', v:data.ypDurum})
      if (data.ypTur) s.push({l:'Parça türü', v:data.ypTur})
      if (data.ypKategori) s.push({l:'Parça kategorisi', v:data.ypKategori})
      if (data.ypMarka) s.push({l:'Marka/Model', v:data.ypMarka})
      if (data.ypUyumluArac) s.push({l:'Uyumlu araç', v:data.ypUyumluArac})
      if (data.ypUyumluYilMin||data.ypUyumluYilMax) s.push({l:'Uyumlu yıl', v:(data.ypUyumluYilMin||'?')+' – '+(data.ypUyumluYilMax||'?')})
    }
    if (data.aciklama) s.push({l:'Açıklama', v:data.aciklama.slice(0,80)+(data.aciklama.length>80?'…':'')})
    s.push({l:'İletişim', v:data.iletisimTercihi==='mesaj'?'💬 Sadece mesaj':'📞 Mesaj + Telefon'})
    return s
  }

  if (!open) return null
  const gecerli = validate(step, data, giris)
  const onayAdimi = step === TOPLAM

  function fiyatYuvarla(deger) {
    let n = Number(String(deger).replace(/[^\d]/g, ''))
    if (!n || n <= 0) return ''
    let adim
    if (n < 1000) adim = 50
    else if (n < 10000) adim = 500
    else if (n < 100000) adim = 5000
    else if (n < 1000000) adim = 10000
    else if (n < 10000000) adim = 50000
    else adim = 100000
    return String(Math.round(n / adim) * adim)
  }
  function m2Yuvarla(deger) {
    let n = Number(String(deger).replace(/[^\d]/g, ''))
    if (!n || n <= 0) return ''
    return String(Math.round(n / 5) * 5)
  }
  function kmYuvarla(deger) {
    let n = Number(String(deger).replace(/[^\d]/g, ''))
    if (!n || n <= 0) return ''
    return String(Math.round(n / 1000) * 1000)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>

        {/* HEADER */}
        <div className={styles.boxTop}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <h2 className={styles.title}>{done ? (duzenlenecekIlan ? 'Değişiklikleriniz alındı! 📨' : 'İlanınız alındı! 📨') : (duzenlenecekIlan && onayAdimi ? 'Değişiklikleri Onayla' : STEPS[step-1])}</h2>
              {!done && <p className={styles.sub}>Adım {step} / {TOPLAM}</p>}
            </div>
            <button className={styles.close} onClick={() => { reset(); onClose() }}>✕</button>
          </div>
          {!done && (
            <div className={styles.progress}>
              {STEPS.map((_,i) => (
                <div key={i} className={`${styles.prog} ${step>i+1?styles.progDone:''} ${step===i+1?styles.progActive:''}`} />
              ))}
            </div>
          )}
        </div>

        {/* BODY */}
        <div className={styles.boxBody} ref={bodyRef}>
          {done ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>📨</div>
              {duzenlenecekIlan ? (
                <>
                  <h3>Değişiklikleriniz onaya gönderildi!</h3>
                  <p style={{lineHeight:1.6}}>Mevcut ilanınız <strong>olduğu gibi yayında kalmaya devam edecek</strong>. Yönetici onayından sonra yeni bilgileriniz yayına alınacak.</p>
                </>
              ) : (
                <>
                  <h3>İlanınız onaya gönderildi!</h3>
                  <p style={{lineHeight:1.6}}>İlanınız <strong>onay bekliyor</strong>. Yönetici onayından sonra kısa sürede yayına alınacak ve satıcılar size ulaşabilecek.</p>
                </>
              )}
              <div className={styles.successInfo}>
                <p>🔒 Telefon numaranız gizlidir</p>
                <p>👤 Yalnızca adınız ve soyad baş harfiniz görünür</p>
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}}
                onClick={() => { reset(); onClose() }}>Tamam ✕</button>
            </div>
          ) : (
            <>
              {/* ADIM 1: KATEGORİ */}
              {step === 1 && (
                <div className={styles.katWizard2}>
                  {katYol.length > 0 && (
                    <div className={styles.katBreadcrumb}>
                      <button
                        onClick={katGeri}
                        style={{
                          display:'flex', alignItems:'center', gap:4,
                          padding:'4px 10px', borderRadius:8, border:'none',
                          background:'#f1f5f9', color:'#374151',
                          fontSize:12, fontWeight:500, cursor:'pointer',
                          fontFamily:'inherit',
                        }}>
                        ← Geri
                      </button>
                      {katYol.map((k, i) => (
                        <span key={k.id || k.slug} className={styles.katBcItem}>
                          <span className={styles.katBcSep}>›</span>
                          <button onClick={() => setKatYol(katYol.slice(0, i+1))}>{k.label}</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.katBaslik2}>
                    {katYol.length === 0 ? 'Ne almak istiyorsunuz?' : `${katYol[katYol.length-1].label} içinde seçin`}
                  </div>

                  {aktifKatListesi.length > 0 ? (
                    <div className={styles.katGrid2}>
                      {aktifKatListesi.map(k => {
                        const cocukVar = k.altKategoriler && k.altKategoriler.length > 0
                        return (
                          <div key={k.id || k.slug} className={styles.katKart2Wrap}>
                            <button className={styles.katKart2} onClick={() => katSec(k)}>
                              {k.icon && <span className={styles.katKart2Icon}>{k.icon}</span>}
                              <span className={styles.katKart2Label}>{k.label}</span>
                              {cocukVar
                                ? <span className={styles.katKart2Ok}>›</span>
                                : <span className={styles.katKart2Sec}>Seç →</span>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className={styles.katSonSeviye}>
                      <div className={styles.katSonIkon}>✓</div>
                      <div className={styles.katSonBaslik}>{katYol[katYol.length-1]?.label} seçildi</div>
                      <div className={styles.katSonAlt}>Bu kategori için ilan vermeye devam edin</div>
                      <button className={styles.katDevamBurada} onClick={() => { kategoriOnayla(); ileri() }}>
                        Devam et →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 2: KONUM — İşlem türü artık burada YOK, kategori seçiminden otomatik geliyor */}
              {step === 2 && (
                <div>
                  {/* Seçilen kategori özeti */}
                  {katYol.length > 0 && (
                    <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px',marginBottom:16}}>
                      <div style={{fontSize:11,fontWeight:600,color:'#085549',marginBottom:2}}>
                        ✓ Seçilen kategori — {data.islemTuru === 'kirala' ? '🔑 Kiralamak' : '💰 Satın Almak'}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                        {katYol.map(k=>k.label).join(' › ')}
                      </div>
                    </div>
                  )}
                  {KONUM_GEREKMEYEN_KATEGORILER.includes(data.kategori) && (
                    <label style={{display:'flex',alignItems:'center',gap:10,background:'#F0FDFA',border:'1px solid #99E6D9',borderRadius:10,padding:'12px 14px',marginBottom:16,cursor:'pointer'}}>
                      <input type="checkbox" checked={data.tumTurkiye}
                        onChange={e => {
                          const checked = e.target.checked
                          set('tumTurkiye', checked)
                          if (checked) { set('sehir',''); set('ilce',''); set('konumlar',[]); setKonumlar([]) }
                        }}
                        style={{width:18,height:18,accentColor:'#0D7A6B',cursor:'pointer'}} />
                      <span style={{fontSize:14,fontWeight:600,color:'#085549'}}>
                        🌍 Şehir fark etmez — Türkiye genelinden teklif almak istiyorum
                      </span>
                    </label>
                  )}

                  <div className={styles.fieldGroup} style={{opacity: data.tumTurkiye ? 0.4 : 1, pointerEvents: data.tumTurkiye ? 'none' : 'auto', transition:'opacity 0.2s'}}>
                    <label className="form-label">Şehir *</label>
                    <select className="form-select" disabled={data.tumTurkiye} style={{
                      background: !data.sehir ? '#FFFBEB' : '#f0fdf4',
                      borderColor: !data.sehir ? '#FCD34D' : '#86efac',
                    }} value={data.sehir}
                      onChange={e => { set('sehir',e.target.value); set('ilce','') }}>
                      <option value="">Şehir seçin *</option>
                      {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                    </select>
                  </div>
                  {data.sehir && !data.tumTurkiye && (
                    <div className={styles.fieldGroup}>
                      <label className="form-label">İlçe (isteğe bağlı)</label>
                      <select className="form-select" value={data.ilce} onChange={e => set('ilce',e.target.value)}>
                        <option value="">Tüm ilçeler</option>
                        {getIlceler(data.sehir).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  )}

                  <button onClick={konumEkle} disabled={!data.sehir || data.tumTurkiye}
                    style={{width:'100%',marginTop:4,marginBottom:8,padding:'14px',minHeight:48,
                      background: (data.sehir && !data.tumTurkiye) ? '#0D7A6B' : '#cbd5e1', color:'white',
                      border:'none',borderRadius:10,fontSize:15,fontWeight:600,
                      opacity: data.tumTurkiye ? 0.4 : 1,
                      cursor: (data.sehir && !data.tumTurkiye) ? 'pointer':'not-allowed',fontFamily:'inherit',transition:'opacity 0.2s'}}>
                    + Bu konumu ekle
                  </button>
                  <div style={{fontSize:12.5,color:'#8a95a3',marginBottom:14,opacity: data.tumTurkiye ? 0.4 : 1}}>💡 Birden fazla bölge ekleyebilirsiniz. "Tüm ilçeler" seçerseniz o şehrin tamamında görünürsünüz. Her bölgenin satıcıları talebinizi görür.</div>

                  {!data.tumTurkiye && konumlar.length > 0 && (
                    <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'12px 14px'}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:8}}>
                        ✓ Eklenen konumlar ({konumlar.length})
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {konumlar.map((k, i) => (
                          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'white',borderRadius:8,padding:'10px 12px'}}>
                            <span style={{fontSize:14,color:'#085549',fontWeight:500}}>📍 {k.sehir}{k.ilce ? ' / ' + k.ilce : ' (tüm ilçeler)'}</span>
                            <button onClick={() => konumCikar(i)} style={{border:'none',background:'#FEF2F2',color:'#DC2626',borderRadius:7,width:32,height:32,minWidth:32,cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:15}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 3: FİYAT & ÖZELLİKLER */}
              {step === 3 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">{data.kategori === 'is-ilanlari' ? 'Maaş beklentisi (₺)' : 'Bütçe aralığı (₺)'} <span style={{color:"#dc2626",fontWeight:700}}>*</span></label>
                    {(() => {
                      const min = Number(data.fiyatMin) || 0
                      const max = Number(data.fiyatMax) || 0
                      const hatali = min > 0 && max > 0 && min >= max
                      const kirmizi = { borderColor: '#DC2626', background: '#FEF2F2' }
                      return (
                        <>
                          <div className={styles.rangeRow}>
                            <input className="form-select" style={{flex:1,minWidth:0}} type="text" inputMode="numeric"
                              placeholder="0"
                              value={data.fiyatMin ? Number(data.fiyatMin).toLocaleString('tr-TR') : '0'}
                              onChange={e => set('fiyatMin', e.target.value.replace(/[^\d]/g, '') || '0')}
                              onBlur={e => set('fiyatMin', fiyatYuvarla(e.target.value) || '0')} />
                            <span className={styles.rangeSep}>–</span>
                            <input className="form-select" style={{flex:1,minWidth:0,
                              background: !data.fiyatMax ? '#FFFBEB' : '#f0fdf4',
                              borderColor: !data.fiyatMax ? '#FCD34D' : '#86efac',
                            }} type="text" inputMode="numeric"
                              placeholder={data.kategori === 'is-ilanlari' ? 'En fazla ₺ (üst sınır) *' : 'En fazla ₺ *'}
                              value={data.fiyatMax ? Number(data.fiyatMax).toLocaleString('tr-TR') : ''}
                              onChange={e => set('fiyatMax', e.target.value.replace(/[^\d]/g, ''))}
                              onBlur={e => set('fiyatMax', fiyatYuvarla(e.target.value))} />
                          </div>
                          {hatali
                            ? <div style={{fontSize:12.5,color:'#DC2626',fontWeight:600,marginTop:6}}>⚠️ En fazla değeri, en az değerinden büyük olmalı</div>
                            : <div style={{fontSize:11.5,color:'#8a95a3',marginTop:6}}>{data.kategori === 'is-ilanlari' ? '💡 İş veren, bu aralıktaki adaylara teklif sunabilir' : '💡 Değerler otomatik yuvarlanır'}</div>
                          }
                        </>
                      )
                    })()}
                  </div>

                  {/* EMLAK */}
                  {data.kategori === 'emlak' && <>
                    {(katYol.length > 1 || data.emlakTip) ? (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.length > 1 ? katYol.map(k=>k.label).join(' › ') : data.emlakTip}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Emlak tipi *</label>
                        <div className={styles.chipGroup}>
                          {emlakTipler.map(t => (
                            <button key={t} className={`${styles.chip} ${data.emlakTip===t?styles.chipSel:''}`}
                              onClick={() => {
                                if (data.emlakTip && data.emlakTip !== t) { set('tercihler',[]); set('oda',[]) }
                                set('emlakTip', t)
                                set('emlakGrubu', emlakGrubu(katYol, t))
                              }}>{t}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Metrekare aralığı (m²) <span style={{color:"#dc2626",fontWeight:700}}>*</span> <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>en fazla sınırsız</span></label>
                      {(() => {
                        const mn = Number(data.m2Min)||0, mx = Number(data.m2Max)||0
                        const hatali = mn>0 && mx>0 && mn>=mx
                        const k = {borderColor:'#DC2626',background:'#FEF2F2'}
                        return (
                          <>
                            <div className={styles.rangeRow}>
                              <input className="form-select" style={{flex:1,minWidth:0,
                                background: !data.m2Min ? '#FFFBEB' : '#f0fdf4',
                                borderColor: !data.m2Min ? '#FCD34D' : hatali ? '#DC2626' : '#86efac',
                              }} type="text" inputMode="numeric"
                                placeholder="En az m² *"
                                value={data.m2Min||''}
                                onChange={e=>set('m2Min',e.target.value.replace(/[^\d]/g,''))}
                                onBlur={e=>set('m2Min',m2Yuvarla(e.target.value))} />
                              <span className={styles.rangeSep}>–</span>
                              <input className="form-select" style={{flex:1,minWidth:0}} type="text" inputMode="numeric"
                                placeholder="∞ sınırsız"
                                value={data.m2Max||''}
                                onChange={e=>set('m2Max',e.target.value.replace(/[^\d]/g,''))}
                                onBlur={e=>set('m2Max',m2Yuvarla(e.target.value))} />
                            </div>
                            {hatali
                              ? <div style={{fontSize:12.5,color:'#DC2626',fontWeight:600,marginTop:6}}>⚠️ En fazla m², en az m²'den büyük olmalı</div>
                              : <div style={{fontSize:11.5,color:'#8a95a3',marginTop:6}}>💡 5'in katına yuvarlanır</div>
                            }
                          </>
                        )
                      })()}
                    </div>
                    {data.emlakGrubu === 'konut' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Oda sayısı * <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(en az 1 seçin)</span></label>
                        <OdaSecici oda={data.oda} toggle={(o)=>toggle('oda',o)} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Özellikler</label>
                        <div className={styles.chipGroup}>
                          {emlakOzellikleri.map(t => (
                            <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                              onClick={()=>toggle('tercihler',t)}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </>}

                    {data.emlakGrubu === 'arazi' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">İmar durumu</label>
                        <div className={styles.chipGroup}>
                          {imarDurumlari.map(t => (
                            <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                              onClick={()=>{
                                const temizlenen = data.tercihler.filter(x=>!imarDurumlari.includes(x))
                                set('tercihler', [...temizlenen, t])
                              }}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Tapu durumu</label>
                        <div className={styles.chipGroup}>
                          {tapuDurumlari.map(t => (
                            <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                              onClick={()=>{
                                const temizlenen = data.tercihler.filter(x=>!tapuDurumlari.includes(x))
                                set('tercihler', [...temizlenen, t])
                              }}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Diğer özellikler</label>
                        <div className={styles.chipGroup}>
                          {['Yola cephe','Köşe parsel'].map(t => (
                            <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                              onClick={()=>toggle('tercihler',t)}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </>}

                    {data.emlakGrubu === 'ticari' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Kullanım tipi</label>
                        <div className={styles.chipGroup}>
                          {ticariKullanimTipleri.map(t => (
                            <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                              onClick={()=>{
                                const temizlenen = data.tercihler.filter(x=>!ticariKullanimTipleri.includes(x))
                                set('tercihler', [...temizlenen, t])
                              }}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Özellikler</label>
                        <div className={styles.chipGroup}>
                          {['Otopark','Vitrin/Cephe','Asansör'].map(t => (
                            <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                              onClick={()=>toggle('tercihler',t)}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </>}
                  </>}

                  {/* VASITA */}
                  {data.kategori === 'vasita' && <>
                    {(katYol.length > 1 || data.vasitaMarka) && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.length>1 ? katYol.map(k=>k.label).join(' › ') : (data.vasitaMarka+' '+(data.vasitaModel||''))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* YEDEK PARÇA & AKSESUAR — model yılı/km/yakıt/vites hiçbiri anlamlı değil */}
                    {data.vasitaGrubu === 'yedek-parca' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Uyumlu marka / model <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <input className="form-select" type="text"
                          placeholder="Örn: BMW E46, Honda CBR 600, Yamaha jet ski motoru"
                          value={data.uyumluParca}
                          onChange={e=>set('uyumluParca', e.target.value)} />
                        <div style={{fontSize:11.5,color:'#8a95a3',marginTop:6}}>💡 Aradığınız parçanın uyumlu olduğu araç marka/modelini yazabilirsiniz</div>
                      </div>
                    </>}

                    {/* DENİZ ARAÇLARI — km/vites yerine uzunluk + motor gücü */}
                    {data.vasitaGrubu === 'deniz' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Model yılı aralığı <span style={{color:"#dc2626",fontWeight:700}}>*</span></label>
                        <div className={styles.rangeRow}>
                          <select className="form-select" style={{flex:1,
                            background: !data.yilMin ? '#FFFBEB' : '#f0fdf4',
                            borderColor: !data.yilMin ? '#FCD34D' : '#86efac',
                          }} value={data.yilMin} onChange={e=>set('yilMin',e.target.value)}>
                            <option value="">En eski yıl *</option>
                            {YIL_SECENEKLER.map(y=><option key={y} value={y}>{y}</option>)}
                          </select>
                          <span className={styles.rangeSep}>–</span>
                          <select className="form-select" style={{flex:1,
                            background: !data.yilMax ? '#FFFBEB' : '#f0fdf4',
                            borderColor: !data.yilMax ? '#FCD34D' : '#86efac',
                          }} value={data.yilMax || String(new Date().getFullYear())} onChange={e=>set('yilMax',e.target.value)}>
                            <option value="">En yeni yıl *</option>
                            {YIL_SECENEKLER.filter(y=>!data.yilMin||y>=Number(data.yilMin)).map(y=><option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Uzunluk aralığı (metre) <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>en fazla sınırsız</span></label>
                        <div className={styles.rangeRow}>
                          <input className="form-select" type="text" inputMode="numeric"
                            placeholder="En az m"
                            value={data.uzunlukMin}
                            onChange={e=>set('uzunlukMin', e.target.value.replace(/[^\d.,]/g,''))} />
                          <span className={styles.rangeSep}>–</span>
                          <input className="form-select" type="text" inputMode="numeric"
                            placeholder="∞ sınırsız"
                            value={data.uzunlukMax}
                            onChange={e=>set('uzunlukMax', e.target.value.replace(/[^\d.,]/g,''))} />
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Motor gücü (HP) <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <input className="form-select" type="text" inputMode="numeric"
                          placeholder="Fark etmez (boş bırakın)"
                          value={data.motorGucu}
                          onChange={e=>set('motorGucu', e.target.value.replace(/[^\d]/g,''))} />
                      </div>
                    </>}

                    {/* HAVA ARAÇLARI — km/vites yerine uçuş saati */}
                    {data.vasitaGrubu === 'hava' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Model yılı aralığı <span style={{color:"#dc2626",fontWeight:700}}>*</span></label>
                        <div className={styles.rangeRow}>
                          <select className="form-select" style={{flex:1,
                            background: !data.yilMin ? '#FFFBEB' : '#f0fdf4',
                            borderColor: !data.yilMin ? '#FCD34D' : '#86efac',
                          }} value={data.yilMin} onChange={e=>set('yilMin',e.target.value)}>
                            <option value="">En eski yıl *</option>
                            {YIL_SECENEKLER.map(y=><option key={y} value={y}>{y}</option>)}
                          </select>
                          <span className={styles.rangeSep}>–</span>
                          <select className="form-select" style={{flex:1,
                            background: !data.yilMax ? '#FFFBEB' : '#f0fdf4',
                            borderColor: !data.yilMax ? '#FCD34D' : '#86efac',
                          }} value={data.yilMax || String(new Date().getFullYear())} onChange={e=>set('yilMax',e.target.value)}>
                            <option value="">En yeni yıl *</option>
                            {YIL_SECENEKLER.filter(y=>!data.yilMin||y>=Number(data.yilMin)).map(y=><option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Maksimum uçuş saati <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <input className="form-select" type="text" inputMode="numeric"
                          placeholder="Fark etmez (boş bırakın)"
                          value={data.ucusSaatiMax}
                          onChange={e=>set('ucusSaatiMax', e.target.value.replace(/[^\d]/g,''))} />
                      </div>
                    </>}

                    {/* STANDART — Otomobil, Arazi&SUV, Motosiklet, Minivan, Ticari, Elektrikli, Klasik,
                        Kiralık, Karavan, ATV, UTV, Engelli Plakalı — mevcut davranış, değişiklik yok */}
                    {data.vasitaGrubu === 'standart' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Model yılı aralığı <span style={{color:"#dc2626",fontWeight:700}}>*</span></label>
                        <div className={styles.rangeRow}>
                          <select className="form-select" style={{flex:1,
                            background: !data.yilMin ? '#FFFBEB' : '#f0fdf4',
                            borderColor: !data.yilMin ? '#FCD34D' : '#86efac',
                          }} value={data.yilMin} onChange={e=>set('yilMin',e.target.value)}>
                            <option value="">En eski yıl *</option>
                            {YIL_SECENEKLER.map(y=><option key={y} value={y}>{y}</option>)}
                          </select>
                          <span className={styles.rangeSep}>–</span>
                          <select className="form-select" style={{flex:1,
                            background: !data.yilMax ? '#FFFBEB' : '#f0fdf4',
                            borderColor: !data.yilMax ? '#FCD34D' : '#86efac',
                          }} value={data.yilMax || String(new Date().getFullYear())} onChange={e=>set('yilMax',e.target.value)}>
                            <option value="">En yeni yıl *</option>
                            {YIL_SECENEKLER.filter(y=>!data.yilMin||y>=Number(data.yilMin)).map(y=><option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Maksimum KM</label>
                        <input className="form-select" type="text" inputMode="numeric"
                          placeholder="Fark etmez (boş bırakın)"
                          value={data.kmMax ? Number(data.kmMax).toLocaleString('tr-TR') : ''}
                          onChange={e=>set('kmMax',e.target.value.replace(/[^\d]/g,''))}
                          onBlur={e=>set('kmMax',kmYuvarla(e.target.value))} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Yakıt tipi</label>
                        <div className={styles.chipGroup}>
                          {yakitTipleri.map(y=><button key={y} className={`${styles.chip} ${data.yakit.includes(y)?styles.chipSel:''}`} onClick={()=>toggle('yakit',y)}>{y}</button>)}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Vites tipi</label>
                        <div className={styles.chipGroup}>
                          {vitesTipleri.map(v=><button key={v} className={`${styles.chip} ${data.vites.includes(v)?styles.chipSel:''}`} onClick={()=>toggle('vites',v)}>{v}</button>)}
                        </div>
                      </div>
                    </>}
                  </>}

                  {/* İKİNCİ EL VE SIFIR ALIŞVERİŞ */}
                  {data.kategori === 'ikinci-el-sifir-alisveris' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Durum * <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(en az 1 seçin)</span></label>
                      <TekSecimChipGrubu secenekler={ALISVERIS_DURUM} secili={data.alisverisDurum} onSec={(d)=>set('alisverisDurum', d)} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Marka / Model <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <input className="form-select" type="text"
                        placeholder="Örn: Samsung, IKEA, Nike, fark etmez"
                        value={data.alisverisMarka}
                        onChange={e=>set('alisverisMarka', e.target.value)} />
                    </div>
                    {alisverisGiyimMi(katYol) && (
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Beden / Numara <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <input className="form-select" type="text"
                          placeholder="Örn: M, 42, 38 numara"
                          value={data.alisverisBeden}
                          onChange={e=>set('alisverisBeden', e.target.value)} />
                      </div>
                    )}
                  </>}

                  {/* İŞ MAKİNELERİ & SANAYİ */}
                  {data.kategori === 'is-makineleri' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Durum * <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(en az 1 seçin)</span></label>
                      <TekSecimChipGrubu secenekler={ISMAKINESI_DURUM} secili={data.ismakinesiDurum} onSec={(d)=>set('ismakinesiDurum', d)} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Marka / Model <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <input className="form-select" type="text"
                        placeholder="Örn: Caterpillar, John Deere, fark etmez"
                        value={data.ismakinesiMarka}
                        onChange={e=>set('ismakinesiMarka', e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Üretim yılı aralığı <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.rangeRow}>
                        <select className="form-select" style={{flex:1}} value={data.ismakinesiYilMin} onChange={e=>set('ismakinesiYilMin',e.target.value)}>
                          <option value="">En eski yıl</option>
                          {YIL_SECENEKLER.map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className={styles.rangeSep}>–</span>
                        <select className="form-select" style={{flex:1}} value={data.ismakinesiYilMax} onChange={e=>set('ismakinesiYilMax',e.target.value)}>
                          <option value="">En yeni yıl</option>
                          {YIL_SECENEKLER.filter(y=>!data.ismakinesiYilMin||y>=Number(data.ismakinesiYilMin)).map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </>}

                  {/* HAYVANLAR */}
                  {data.kategori === 'hayvanlar' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}

                    {data.hayvanGrubu === 'urun' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Durum * <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(en az 1 seçin)</span></label>
                        <TekSecimChipGrubu secenekler={HAYVAN_DURUM} secili={data.hayvanDurum} onSec={(d)=>set('hayvanDurum', d)} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Marka / Model <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <input className="form-select" type="text"
                          placeholder="Örn: Royal Canin, Trixie, fark etmez"
                          value={data.hayvanMarka}
                          onChange={e=>set('hayvanMarka', e.target.value)} />
                      </div>
                    </>}

                    {data.hayvanGrubu === 'canli' && <>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Yaş <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <div className={styles.chipGroup}>
                          {HAYVAN_YAS.map(y => (
                            <button key={y} className={`${styles.chip} ${data.hayvanYas===y?styles.chipSel:''}`}
                              onClick={()=>set('hayvanYas', y)}>{y}</button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Cinsiyet <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                        <div className={styles.chipGroup}>
                          {HAYVAN_CINSIYET.map(c => (
                            <button key={c} className={`${styles.chip} ${data.hayvanCinsiyet===c?styles.chipSel:''}`}
                              onClick={()=>set('hayvanCinsiyet', c)}>{c}</button>
                          ))}
                        </div>
                      </div>
                    </>}
                  </>}

                  {/* HİZMETLER */}
                  {data.kategori === 'hizmetler' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Hizmet yeri <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {HIZMET_YERI.map(y => (
                          <button key={y} className={`${styles.chip} ${data.hizmetYeri===y?styles.chipSel:''}`}
                            onClick={()=>set('hizmetYeri', y)}>{y}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Aciliyet <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {HIZMET_ACILIYET.map(a => (
                          <button key={a} className={`${styles.chip} ${data.hizmetAciliyet===a?styles.chipSel:''}`}
                            onClick={()=>set('hizmetAciliyet', a)}>{a}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {/* ÖZEL DERS */}
                  {data.kategori === 'ozel-ders' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Ders şekli <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_SEKIL.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersSekil===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersSekil', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Öğrenci seviyesi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_SEVIYE.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersSeviye===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersSeviye', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Sıklık <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_SIKLIK.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersSiklik===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersSiklik', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Ders yeri tercihi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_YER.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersYer===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersYer', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Ders süresi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_SURE.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersSure===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersSure', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Öğretmen deneyim seviyesi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_DENEYIM.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersDeneyim===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersDeneyim', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Birey / Grup <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {OZELDERS_GRUP.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ozeldersGrup===o?styles.chipSel:''}`}
                            onClick={()=>set('ozeldersGrup', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {/* İŞ İLANLARI */}
                  {data.kategori === 'is-ilanlari' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Çalışma şekli <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {ISILANLARI_CALISMA_SEKLI.map(o => (
                          <button key={o} className={`${styles.chip} ${data.isilanlariCalismaSekli===o?styles.chipSel:''}`}
                            onClick={()=>set('isilanlariCalismaSekli', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Deneyim seviyesi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {ISILANLARI_DENEYIM.map(o => (
                          <button key={o} className={`${styles.chip} ${data.isilanlariDeneyim===o?styles.chipSel:''}`}
                            onClick={()=>set('isilanlariDeneyim', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Sözleşme türü <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {ISILANLARI_SOZLESME.map(o => (
                          <button key={o} className={`${styles.chip} ${data.isilanlariSozlesme===o?styles.chipSel:''}`}
                            onClick={()=>set('isilanlariSozlesme', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Eğitim seviyesi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {ISILANLARI_EGITIM.map(o => (
                          <button key={o} className={`${styles.chip} ${data.isilanlariEgitim===o?styles.chipSel:''}`}
                            onClick={()=>set('isilanlariEgitim', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Seyahat gereksinimi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {ISILANLARI_SEYAHAT.map(o => (
                          <button key={o} className={`${styles.chip} ${data.isilanlariSeyahat===o?styles.chipSel:''}`}
                            onClick={()=>set('isilanlariSeyahat', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {/* YEDEK PARÇA, AKSESUAR, DONANIM & TUNING */}
                  {data.kategori === 'yedek-parca-aksesuar-donanim-tuning' && <>
                    {katYol.length > 1 && (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px'}}>
                          <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Seçtiğiniz kategori</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                            {katYol.map(k=>k.label).join(' › ')}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Durum <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {YEDEKPARCA_DURUM.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ypDurum===o?styles.chipSel:''}`}
                            onClick={()=>set('ypDurum', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Parça türü <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {YEDEKPARCA_TUR.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ypTur===o?styles.chipSel:''}`}
                            onClick={()=>set('ypTur', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Parça kategorisi <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.chipGroup}>
                        {YEDEKPARCA_KATEGORI.map(o => (
                          <button key={o} className={`${styles.chip} ${data.ypKategori===o?styles.chipSel:''}`}
                            onClick={()=>set('ypKategori', o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Marka / Model <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <input className="form-select" type="text"
                        placeholder="Örn: Bosch, Brembo, fark etmez"
                        value={data.ypMarka}
                        onChange={e=>set('ypMarka', e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Uyumlu araç <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <input className="form-select" type="text"
                        placeholder="Örn: BMW E46, Honda CBR 600, 25 ayak motoryat"
                        value={data.ypUyumluArac}
                        onChange={e=>set('ypUyumluArac', e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Uyumlu model yılı aralığı <span style={{fontWeight:400,color:"#8a95a3",fontSize:11}}>(isteğe bağlı)</span></label>
                      <div className={styles.rangeRow}>
                        <select className="form-select" style={{flex:1}} value={data.ypUyumluYilMin} onChange={e=>set('ypUyumluYilMin',e.target.value)}>
                          <option value="">En eski yıl</option>
                          {YIL_SECENEKLER.map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className={styles.rangeSep}>–</span>
                        <select className="form-select" style={{flex:1}} value={data.ypUyumluYilMax} onChange={e=>set('ypUyumluYilMax',e.target.value)}>
                          <option value="">En yeni yıl</option>
                          {YIL_SECENEKLER.filter(y=>!data.ypUyumluYilMin||y>=Number(data.ypUyumluYilMin)).map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </>}


                </div>

              )}

              {/* ADIM 4: AÇIKLAMA */}
              {step === 4 && (
                <AciklamaAdimi
                  data={data}
                  set={set}
                  katYol={katYol}
                />
              )}

              {/* ADIM 5: İLETİŞİM */}
              {step === 5 && (
                <div>
                  <p style={{fontSize:14,color:'#4a5568',marginBottom:16,lineHeight:1.7}}>
                    Satıcılar size nasıl ulaşsın? <strong>💬 Mesaj her zaman açık</strong> kalır.
                  </p>
                  <div className={styles.iletisimKartlar}>
                    <button className={`${styles.iletisimKart} ${data.iletisimTercihi==='mesaj'?styles.iletisimSel:''}`}
                      onClick={()=>set('iletisimTercihi','mesaj')}>
                      <div className={styles.iletisimUst}><span className={styles.iletisimIcon}>💬</span></div>
                      <div className={styles.iletisimBaslik}>Sadece Mesaj</div>
                      <div className={styles.iletisimAcik}>Telefon numaranız <strong>gizli</strong> kalır.</div>
                      <div className={styles.iletisimTag}>🔒 Telefonunuz kimseye gösterilmez</div>
                    </button>
                    <button className={`${styles.iletisimKart} ${data.iletisimTercihi==='telefon'?styles.iletisimSel:''}`}
                      onClick={()=>set('iletisimTercihi','telefon')}>
                      <div className={styles.iletisimUst}>
                        <span className={styles.iletisimIcon}>📞</span>
                        <span className={`${styles.iletisimOneri} ${data.iletisimTercihi==='telefon'?styles.iletisimOneriSel:''}`}>ÖNERİLEN</span>
                      </div>
                      <div className={styles.iletisimBaslik}>Mesaj + Telefon</div>
                      <div className={styles.iletisimAcik}>Satıcılar sizi <strong>doğrudan arayabilir</strong>.</div>
                      <div className={styles.iletisimTag} style={{background:'#DCFCE7',color:'#15803D'}}>⚡ Daha hızlı iletişim</div>
                    </button>
                  </div>
                </div>
              )}

              {/* ADIM 6 MİSAFİR: BİLGİLER */}
              {step === 6 && !giris && (
                <Adim6Misafir data={data} set={set} />
              )}

              {/* ONAY ADIMI */}
              {onayAdimi && (
                <div>
                  {giris && (
                    <div className={styles.kullaniciBilgi}>
                      <div className={styles.kullaniciAvatar}>{(user.ad?.[0]||'')+(user.soyad?.[0]||'')}</div>
                      <div>
                        <div className={styles.kullaniciAd}>{user.ad} {user.soyad}</div>
                        <div className={styles.kullaniciAlt}><span>📧 {user.email}</span></div>
                      </div>
                      <div className={styles.gizliTag}>{data.iletisimTercihi==='mesaj'?'💬 Sadece mesaj':'📞 Mesaj + Tel'}</div>
                    </div>
                  )}
                  <div className={styles.ozetBaslik}>İlan özeti</div>
                  <div className={styles.ozetKart}>
                    {ozetSatirlar().map((s,i) => (
                      <div key={i} className={styles.ozetSatir}>
                        <span className={styles.ozetLabel}>{s.l}</span>
                        <span className={styles.ozetVal}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.ozetNot}>✓ İstediğiniz zaman silebilir veya pasife alabilirsiniz</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        {!done && (
          <div className={styles.boxFooter}>
            <button className="btn-ghost" onClick={() => { reset(); onClose() }}>
              ✕ Vazgeç
            </button>
            <button className="btn-ghost"
              disabled={step === 1 && katYol.length === 0}
              style={{opacity:(step === 1 && katYol.length === 0) ? 0.4 : 1, cursor:(step === 1 && katYol.length === 0) ? 'not-allowed' : 'pointer'}}
              onClick={birOncekiAdim}>
              ← Geri
            </button>
            {onayAdimi ? (
              <button className="btn-primary" style={{flex:1,justifyContent:'center',opacity:yukleniyor?0.7:1}} 
                onClick={handleSubmit} disabled={yukleniyor}>
                {yukleniyor ? '⏳ Gönderiliyor...' : (duzenlenecekIlan ? '✓ Değişiklikleri Gönder' : '✓ İlanı Yayınla')}
              </button>
            ) : (
              <button className="btn-primary"
                style={{flex:1,justifyContent:'center',opacity:gecerli?1:0.45,cursor:gecerli?'pointer':'not-allowed'}}
                disabled={!gecerli} onClick={gecerli?ileri:undefined}>
                Devam et →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
