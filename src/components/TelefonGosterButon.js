// src/components/TelefonGosterButon.js

import { useState, useEffect } from 'react'

function formatTelefon(telefon) {
  const s = (telefon || '').replace(/\D/g, '')
  if (s.length === 11) return `${s.slice(0,4)} ${s.slice(4,7)} ${s.slice(7,9)} ${s.slice(9,11)}`
  if (s.length === 10) return `0${s.slice(0,3)} ${s.slice(3,6)} ${s.slice(6,8)} ${s.slice(8,10)}`
  return telefon
}

export default function TelefonGosterButon({ ilanId, kullaniciEmail }) {
  const [durum, setDurum] = useState('yukleniyor') // yukleniyor | gizli | acik | hata
  const [telefon, setTelefon] = useState(null)
  const [hataMsg, setHataMsg] = useState(null)
  const [kalanHak, setKalanHak] = useState(null)

  // Sayfa açılınca bu ilanı daha önce gördü mü kontrol et
  useEffect(() => {
    if (!kullaniciEmail || !ilanId) {
      setDurum('gizli')
      return
    }

    async function oncekiKontrol() {
      try {
        const res = await fetch('/api/telefon-goster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ilan_id: ilanId,
            kullanici_email: kullaniciEmail,
            sadece_kontrol: true, // hak düşürme, sadece daha önce gördü mü bak
          }),
        })
        const data = await res.json()

        if (data.izin && data.zaten_goruldu) {
          // Daha önce görmüş, direkt açık göster
          setTelefon(data.telefon)
          setKalanHak(data.kalan_hak ?? null)
          setDurum('acik')
        } else {
          setDurum('gizli')
        }
      } catch {
        setDurum('gizli')
      }
    }

    oncekiKontrol()
  }, [ilanId, kullaniciEmail])

  async function telefonuGoster() {
    if (durum === 'acik') return
    if (!kullaniciEmail) {
      setHataMsg('Telefonu görmek için giriş yapmalısınız')
      setDurum('hata')
      return
    }

    setDurum('yukleniyor')
    setHataMsg(null)

    try {
      const res = await fetch('/api/telefon-goster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ilan_id: ilanId,
          kullanici_email: kullaniciEmail,
          sadece_kontrol: false,
        }),
      })
      const data = await res.json()

      if (data.izin) {
        setTelefon(data.telefon)
        setDurum('acik')
        if (typeof data.kalan_hak === 'number') setKalanHak(data.kalan_hak)
      } else {
        setHataMsg(data.hata || 'Telefon görüntülenemedi')
        setDurum('hata')
        if (data.pro_gerekli) setTimeout(() => { window.location.href = '/pro' }, 2000)
      }
    } catch {
      setHataMsg('Bağlantı hatası, tekrar deneyin')
      setDurum('hata')
    }
  }

  const baseBtn = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 18px', borderRadius: 999, fontSize: 13.5,
    fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
    transition: 'all 0.15s', fontFamily: 'inherit',
    pointerEvents: 'auto',
  }

  // İlk yüklenirken küçük spinner
  if (durum === 'yukleniyor') return (
    <button style={{...baseBtn, background:'#f9fafb', color:'#9ca3af', borderColor:'#e5e7eb', cursor:'wait'}} disabled>
      ⏳
    </button>
  )

  if (durum === 'hata') return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <button style={{...baseBtn, background:'#fef2f2', color:'#dc2626', borderColor:'#fecaca', cursor:'default', fontSize:11}}>
        📵 {hataMsg}
      </button>
      {hataMsg?.includes('Pro') && (
        <a href="/pro" style={{fontSize:11,color:'#0D7A6B',textAlign:'center',textDecoration:'underline'}}>Pro üye ol →</a>
      )}
      {hataMsg?.includes('giriş') && (
        <a href="/giris" style={{fontSize:11,color:'#0D7A6B',textAlign:'center',textDecoration:'underline'}}>Giriş yap →</a>
      )}
    </div>
  )

  if (durum === 'acik' && telefon) return (
    <div style={{display:'flex',flexDirection:'column',gap:3}}>
      <a href={`tel:${telefon}`} style={{...baseBtn, background:'#0D7A6B', color:'#fff', borderColor:'#0D7A6B', textDecoration:'none'}}>
        📞 {formatTelefon(telefon)}
      </a>
      {kalanHak !== null && (
        <p style={{fontSize:11,color:'#9ca3af',textAlign:'center',margin:0}}>
          Kalan günlük hak: <strong>{kalanHak}</strong>
        </p>
      )}
    </div>
  )

  // Gizli
  return (
    <button style={{...baseBtn, background:'#fff', color:'#1f2937', borderColor:'#e5e7eb'}} onClick={telefonuGoster}>
      <span style={{fontSize:15}}>📞</span> Telefonu Göster
    </button>
  )
}