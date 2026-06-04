// src/components/SidebarKategoriler.js — 3 seviyeli, state remount korumalı
import { useState, useCallback, memo } from 'react'

const S = {
  ana: { display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'9px 10px',borderRadius:8,border:'1px solid transparent',background:'none',fontSize:13,color:'#4a5568',cursor:'pointer',fontFamily:'inherit',textAlign:'left',marginBottom:2,transition:'all 0.12s' },
  anaAktif: { background:'#E6F5F2',color:'#085549',fontWeight:600,borderColor:'#B2DDD7' },
  alt2Wrap: { paddingLeft:12,borderLeft:'2px solid #B2DDD7',marginLeft:8,marginBottom:4 },
  alt: { display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'7px 10px',borderRadius:6,border:'none',background:'none',fontSize:12.5,color:'#4a5568',cursor:'pointer',fontFamily:'inherit',textAlign:'left',marginBottom:1,transition:'all 0.12s' },
  altAktif: { background:'#0D7A6B',color:'white',fontWeight:500 },
  alt3Wrap: { paddingLeft:12,borderLeft:'2px solid #e2e8f0',marginLeft:8,marginTop:2,marginBottom:4 },
  alt3: { display:'block',width:'100%',padding:'6px 10px',borderRadius:5,border:'none',background:'none',fontSize:12,color:'#8a95a3',cursor:'pointer',fontFamily:'inherit',textAlign:'left',marginBottom:1,transition:'all 0.12s' },
  alt3Aktif: { background:'#085549',color:'white',fontWeight:500 },
  ok: { fontSize:9,opacity:0.6,marginLeft:4 },
}

// memo: parent re-render olunca bu bileşen gereksiz yere remount olmasın
function SidebarKategoriler({ KATEGORILER, activeCategory, onKatChange }) {
  const [acik1, setAcik1] = useState(null)
  const [acik2, setAcik2] = useState(null)

  // Ana kategori: aç/kapa toggle + filtrele
  const handleAna = useCallback((k) => {
    setAcik1(prev => prev === k.slug ? null : k.slug)
    setAcik2(null)
    onKatChange(k.slug, null)
  }, [onKatChange])

  // 2. seviye: alt kategori varsa aç/kapa; her durumda filtrele
  const handleAlt = useCallback((alt) => {
    const cocukVar = alt.altKategoriler && alt.altKategoriler.length > 0
    setAcik2(prev => prev === alt.slug ? null : alt.slug)
    // Filtrele (üst kategori bazlı)
    onKatChange(alt.slug, null)
  }, [onKatChange])

  // 3. seviye: emlak_tip / marka filtresiyle
  const handleAlt3 = useCallback((alt3) => {
    const filtre = alt3.filtre_tip
      ? { tip: alt3.filtre_tip, deger: alt3.filtre_deger }
      : (alt3.filtre || null)
    onKatChange(alt3.slug, filtre)
  }, [onKatChange])

  return (
    <div>
      <button style={{ ...S.ana, ...(activeCategory === '' ? S.anaAktif : {}) }}
        onClick={() => { setAcik1(null); setAcik2(null); onKatChange('', null) }}>
        <span>✓ Tümü</span>
      </button>

      {KATEGORILER.map(k => {
        const acikMi1 = acik1 === k.slug
        const altVar = k.altKategoriler && k.altKategoriler.length > 0
        return (
          <div key={k.slug}>
            <button style={{ ...S.ana, ...(activeCategory === k.slug ? S.anaAktif : {}) }}
              onClick={() => handleAna(k)}>
              <span>{k.icon} {k.label}</span>
              {altVar && <span style={S.ok}>{acikMi1 ? '▲' : '▼'}</span>}
            </button>

            {acikMi1 && altVar && (
              <div style={S.alt2Wrap}>
                {k.altKategoriler.map(alt => {
                  const acikMi2 = acik2 === alt.slug
                  const alt3Var = alt.altKategoriler && alt.altKategoriler.length > 0
                  return (
                    <div key={alt.slug}>
                      <button style={{ ...S.alt, ...(activeCategory === alt.slug ? S.altAktif : {}) }}
                        onClick={() => handleAlt(alt)}>
                        <span>{alt.icon} {alt.label}</span>
                        {alt3Var && <span style={S.ok}>{acikMi2 ? '▲' : '▼'}</span>}
                      </button>

                      {acikMi2 && alt3Var && (
                        <div style={S.alt3Wrap}>
                          {alt.altKategoriler.map(alt3 => (
                            <button key={alt3.slug}
                              style={{ ...S.alt3, ...(activeCategory === alt3.slug ? S.alt3Aktif : {}) }}
                              onClick={() => handleAlt3(alt3)}>
                              {alt3.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default memo(SidebarKategoriler)
