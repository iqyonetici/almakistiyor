// src/components/SidebarKategoriler.js — SINIRSIZ seviye, recursive
import { useState, useCallback, memo } from 'react'

const S = {
  btn: (derinlik, aktif) => ({
    display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%',
    padding: derinlik === 0 ? '9px 10px' : '7px 10px',
    borderRadius: derinlik === 0 ? 8 : 6,
    border:'1px solid transparent', background: aktif ? (derinlik===0?'#E6F5F2':'#0D7A6B') : 'none',
    color: aktif ? (derinlik===0?'#085549':'white') : '#4a5568',
    fontWeight: aktif ? 600 : 400,
    borderColor: aktif && derinlik===0 ? '#B2DDD7' : 'transparent',
    fontSize: derinlik === 0 ? 13 : (derinlik === 1 ? 12.5 : 12),
    cursor:'pointer', fontFamily:'inherit', textAlign:'left', marginBottom:1, transition:'all 0.12s',
  }),
  wrap: (derinlik) => ({
    paddingLeft: 12, marginLeft: 8, marginBottom: 3,
    borderLeft: `2px solid ${derinlik === 0 ? '#B2DDD7' : '#e2e8f0'}`,
  }),
  ok: { fontSize:9, opacity:0.6, marginLeft:4 },
}

// Tek bir kategori düğümü — kendini recursive çağırır
function KatDugum({ kat, derinlik, acikSet, toggleAcik, activeCategory, onSec, kardesAnahtarlar }) {
  const cocukVar = kat.altKategoriler && kat.altKategoriler.length > 0
  const anahtar = kat.id || kat.slug
  const acik = acikSet.has(anahtar)
  const aktif = activeCategory === kat.slug

  const tikla = () => {
    // Accordion: bu düğümü aç/kapat, aynı seviyedeki kardeşleri kapat
    if (cocukVar) toggleAcik(anahtar, kardesAnahtarlar)
    const filtre = kat.filtre_tip ? { tip: kat.filtre_tip, deger: kat.filtre_deger } : (kat.filtre || null)
    // DB'deki gerçek seviye (1=ana, 2=alt, 3=marka, 4=model). Yoksa derinlik+1 kullan.
    const seviye = kat.seviye || (derinlik + 1)
    onSec(kat.slug, filtre, seviye)
  }

  // Bu düğümün çocuklarının anahtar listesi (çocuklara kardeş bilgisi olarak geçilir)
  const cocukAnahtarlari = cocukVar
    ? kat.altKategoriler.map(a => a.id || a.slug)
    : []

  return (
    <div>
      <button style={S.btn(derinlik, aktif)} onClick={tikla}>
        <span>{kat.icon ? kat.icon + ' ' : ''}{kat.label}</span>
        {cocukVar && <span style={S.ok}>{acik ? '▲' : '▼'}</span>}
      </button>
      {acik && cocukVar && (
        <div style={S.wrap(derinlik)}>
          {kat.altKategoriler.map(alt => (
            <KatDugum key={alt.id || alt.slug} kat={alt} derinlik={derinlik + 1}
              acikSet={acikSet} toggleAcik={toggleAcik}
              activeCategory={activeCategory} onSec={onSec}
              kardesAnahtarlar={cocukAnahtarlari} />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarKategoriler({ KATEGORILER, activeCategory, onKatChange }) {
  // Açık olan düğümlerin id/slug seti
  const [acikSet, setAcikSet] = useState(new Set())

  // anahtar: açılan/kapatılan düğüm. kardesAnahtarlar: aynı seviyedeki diğer düğümler (kapatılacak)
  const toggleAcik = useCallback((anahtar, kardesAnahtarlar = []) => {
    setAcikSet(prev => {
      const yeni = new Set(prev)
      const acikMiydi = yeni.has(anahtar)
      // Kardeşleri (ve onların tüm alt ağacını) kapat
      if (kardesAnahtarlar.length > 0) {
        kardesAnahtarlar.forEach(k => { if (k !== anahtar) yeni.delete(k) })
      }
      acikMiydi ? yeni.delete(anahtar) : yeni.add(anahtar)
      return yeni
    })
  }, [])

  const onSec = useCallback((slug, filtre, derinlik) => {
    onKatChange(slug, filtre, derinlik)
  }, [onKatChange])

  return (
    <div>
      <button style={S.btn(0, activeCategory === '')}
        onClick={() => { setAcikSet(new Set()); onKatChange('', null) }}>
        <span>✓ Tümü</span>
      </button>
      {(KATEGORILER || []).map(kat => (
        <KatDugum key={kat.id || kat.slug} kat={kat} derinlik={0}
          acikSet={acikSet} toggleAcik={toggleAcik}
          activeCategory={activeCategory} onSec={onSec} />
      ))}
    </div>
  )
}

export default memo(SidebarKategoriler)
