// src/components/SidebarKategoriler.js
// 3 seviyeli kategori accordion — sidebar için ayrı bileşen
import { useState } from 'react'
import styles from '../pages/index.module.css'

export default function SidebarKategoriler({ KATEGORILER, activeCategory, onKatChange }) {
  const [acik1, setAcik1] = useState(null)
  const [acik2, setAcik2] = useState(null)

  const handleAna = (slug) => {
    const yeni = acik1 === slug ? null : slug
    setAcik1(yeni)
    setAcik2(null)
    onKatChange(slug)
  }

  const handleAlt = (slug) => {
    const yeni = acik2 === slug ? null : slug
    setAcik2(yeni)
    onKatChange(slug)
  }

  const handleAlt2 = (slug) => {
    onKatChange(slug)
  }

  return (
    <div>
      <button
        className={`${styles.akkordBtn} ${activeCategory === '' ? styles.akkordAktif : ''}`}
        onClick={() => { onKatChange(''); setAcik1(null); setAcik2(null) }}>
        ✓ Tümü
      </button>

      {KATEGORILER.map(k => (
        <div key={k.slug}>
          {/* 1. SEVİYE */}
          <button
            className={`${styles.akkordBtn} ${activeCategory === k.slug ? styles.akkordAktif : ''}`}
            onClick={() => handleAna(k.slug)}>
            <span>{k.icon} {k.label}</span>
            {k.altKategoriler?.length > 0 && (
              <span style={{ fontSize: 10, color: '#8a95a3' }}>
                {acik1 === k.slug ? '▲' : '▼'}
              </span>
            )}
          </button>

          {/* 2. SEVİYE */}
          {acik1 === k.slug && k.altKategoriler?.map(alt => (
            <div key={alt.slug} className={styles.akkordAlt}>
              <button
                className={`${styles.akkordAltItem} ${activeCategory === alt.slug ? styles.akkordAltAktif : ''}`}
                onClick={() => handleAlt(alt.slug)}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>{alt.icon} {alt.label}</span>
                  {alt.altKategoriler?.length > 0 && (
                    <span style={{ fontSize: 9, opacity: 0.6 }}>{acik2 === alt.slug ? '▲' : '▼'}</span>
                  )}
                </span>
              </button>

              {/* 3. SEVİYE */}
              {acik2 === alt.slug && alt.altKategoriler?.map(alt2 => (
                <div key={alt2.slug} className={styles.akkordAlt2}>
                  <button
                    className={`${styles.akkordAlt2Item} ${activeCategory === alt2.slug ? styles.akkordAlt2Aktif : ''}`}
                    onClick={() => handleAlt2(alt2.slug)}>
                    {alt2.label}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
