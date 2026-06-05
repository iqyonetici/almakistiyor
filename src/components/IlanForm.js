import { useState, useRef, useEffect } from 'react'
import { sehirler, getIlceler } from '../data/sehirler'
import { KATEGORILER } from '../data/kategoriler'
import { VASITA_TREE, getModeller, getVersiyonlar } from '../data/vasita'
import styles from './IlanForm.module.css'

const STEPS_GIRIS   = ['Kategori','Konum','Fiyat & Özellikler','Açıklama','İletişim','Onay']
const STEPS_MISAFIR = ['Kategori','Konum','Fiyat & Özellikler','Açıklama','İletişim','Kişisel Bilgi','Onay']

const emlakTipler   = ['Daire','Villa','Müstakil Ev','Arsa','İşyeri','Depo','Tarla','Yazlık']
const odaSayilari   = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
const emlakOzellikleri = ['Asansör','Otopark','Balkon','Bahçe','Güvenlik','Eşyalı','Site içi','Deniz manzarası']
const vasitaMarkalar = ['Audi','BMW','Citroen','Fiat','Ford','Honda','Hyundai','Kia','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo','Diğer']
const yakitTipleri  = ['Benzin','Dizel','LPG','Hibrit','Elektrikli','Fark etmez']
const vitesTipleri  = ['Otomatik','Manuel','Yarı Otomatik','Fark etmez']

const EMLAK_KIRA_FIYATLAR  = [5000,8000,10000,12000,15000,18000,20000,22000,25000,28000,30000,35000,40000,45000,50000,60000,75000,100000]
const EMLAK_SATIS_FIYATLAR = [500000,750000,1000000,1250000,1500000,1750000,2000000,2500000,3000000,3500000,4000000,5000000,6000000,7500000,10000000,15000000,20000000,25000000]
const VASITA_FIYATLAR      = [100000,150000,200000,250000,300000,350000,400000,450000,500000,600000,700000,800000,900000,1000000,1250000,1500000,1750000,2000000,2500000,3000000]
const GENEL_FIYATLAR       = [1000,2000,5000,10000,15000,20000,30000,50000,75000,100000,150000,200000,300000,500000]
const M2_SECENEKLER        = Array.from({length:28}, (_,i) => (i+1)*25)
const KM_SECENEKLER        = [0,5000,10000,20000,30000,40000,50000,60000,70000,80000,90000,100000,120000,150000,200000,250000]
const YIL_SECENEKLER       = Array.from({length:16}, (_,i) => 2009+i)

function validate(step, data, giris) {
  switch(step) {
    case 1: return !!data.kategori
    case 2: return !!data.sehir
    case 3: {
      if (!data.fiyatMin || !data.fiyatMax) return false
      if (Number(data.fiyatMin) > Number(data.fiyatMax)) return false
      if (data.kategori === 'emlak') {
        if (!data.emlakTip) return false
        if (!data.m2Min || !data.m2Max) return false
        if (data.oda.length === 0) return false
      }
      if (data.kategori === 'vasita') {
        if (!data.yilMin || !data.yilMax) return false
      }
      return true
    }
    case 4: return data.aciklama.trim().length >= 10
    case 5: return !!data.iletisimTercihi
    case 6:
      if (giris) return true
      return !!(data.ad && data.telefon && data.telefon.replace(/\D/g,'').length >= 10)
    default: return true
  }
}

export default function IlanForm({ open, onClose, onSubmit, user, kategoriAgaci }) {
  const giris = !!user
  const STEPS = giris ? STEPS_GIRIS : STEPS_MISAFIR
  const TOPLAM = STEPS.length

  // DB'den gelen kategoriler (yoksa statik yedek)
  const KATLAR = (kategoriAgaci && kategoriAgaci.length) ? kategoriAgaci : KATEGORILER

  const bodyRef = useRef(null)
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [katYol, setKatYol] = useState([])  // seçilen kategori zinciri [{ana},{alt},...]
  const [data, setData] = useState({
    kategori:'', altKategori:'', altKategori2:'',
    islemTuru:'satin-al', sehir:'', ilce:'',
    fiyatMin:'', fiyatMax:'',
    emlakTip:'', m2Min:'', m2Max:'', oda:[], tercihler:[],
    vasitaAltTip:'', vasitaMarka:'', vasitaModel:'', vasitaVersiyon:'',
    markalar:[], yilMin:'', yilMax:'', kmMax:'', yakit:[], vites:[],
    aciklama:'', iletisimTercihi:'mesaj', ad:'', soyad:'', telefon:'',
  })

  const set = (k,v) => setData(d => ({...d,[k]:v}))
  const toggle = (k,v) => setData(d => ({...d,[k]: d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]}))

  // === KATEGORİ NAVİGASYONU (DB-driven, recursive) ===
  // Şu an gösterilecek kategori listesi: yol boşsa ana kategoriler, değilse son seçilenin çocukları
  const aktifKatListesi = katYol.length === 0
    ? KATLAR
    : (katYol[katYol.length - 1].altKategoriler || [])

  // data.kategori/altKategori/altKategori2 + filtreyi yola göre yaz
  function kategoriYazByol(yol) {
    set('kategori', yol[0]?.slug || '')
    set('altKategori', yol[1]?.slug || '')
    set('altKategori2', yol[2]?.slug || '')
    // 3.+ seviyede filtre (marka/emlak_tip) varsa data'ya işle
    const son = yol[yol.length - 1]
    if (son?.filtre_tip === 'marka' && son?.filtre_deger) {
      set('vasitaMarka', son.filtre_deger)
      set('markalar', [son.filtre_deger])
    }
    if (son?.filtre_tip === 'emlak_tip' && son?.filtre_deger) {
      set('emlakTip', son.filtre_deger)
    }
  }

  // Bir kategoriye tıklandı
  function katSec(k) {
    const cocukVar = k.altKategoriler && k.altKategoriler.length > 0
    const yeniYol = [...katYol, k]
    setKatYol(yeniYol)
    kategoriYazByol(yeniYol)
    // Çocuğu yoksa (en alt seviye) → kısa gecikmeyle otomatik 2. adıma geç
    if (!cocukVar) {
      setTimeout(() => setStep(2), 350)
    }
  }

  // Ara kademede "burada devam et" — yolu data'ya yaz
  function kategoriOnayla() {
    kategoriYazByol(katYol)
  }


  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0 }, [step])

  function ileri() { if (!validate(step, data, giris)) return; if (step < TOPLAM) setStep(s => s+1) }
  function geri()  { if (step > 1) setStep(s => s-1) }

  function handleSubmit() {
    const final = giris
      ? {...data, ad:user.ad, soyad:user.soyad, telefon:user.telefon}
      : data
    onSubmit && onSubmit(final)
    setDone(true)
  }

  function reset() {
    setStep(1); setDone(false)
    setKatYol([])
    setData({ kategori:'', altKategori:'', altKategori2:'', islemTuru:'satin-al', sehir:'', ilce:'', fiyatMin:'', fiyatMax:'', emlakTip:'', m2Min:'', m2Max:'', oda:[], tercihler:[], vasitaAltTip:'', vasitaMarka:'', vasitaModel:'', vasitaVersiyon:'', markalar:[], yilMin:'', yilMax:'', kmMax:'', yakit:[], vites:[], aciklama:'', iletisimTercihi:'mesaj', ad:'', soyad:'', telefon:'' })
  }

  function getFiyatlar() {
    if (data.kategori === 'emlak') return data.islemTuru === 'kirala' ? EMLAK_KIRA_FIYATLAR : EMLAK_SATIS_FIYATLAR
    if (data.kategori === 'vasita') return VASITA_FIYATLAR
    return GENEL_FIYATLAR
  }

  function ozetSatirlar() {
    const anaKat = KATEGORILER.find(k => k.slug === data.kategori)
    const altKat = anaKat?.altKategoriler?.find(a => a.slug === data.altKategori)
    const altKat2 = altKat?.altKategoriler?.find(a => a.slug === data.altKategori2)
    const s = []
    s.push({l:'Kategori', v:[anaKat?.label, altKat?.label, altKat2?.label].filter(Boolean).join(' › ')})
    s.push({l:'İşlem', v:data.islemTuru==='satin-al'?'Satın almak':'Kiralamak'})
    if (data.sehir) s.push({l:'Konum', v:data.sehir+(data.ilce?' / '+data.ilce:'')})
    if (data.fiyatMin||data.fiyatMax) s.push({l:'Bütçe', v:'₺'+Number(data.fiyatMin).toLocaleString('tr-TR')+' – ₺'+Number(data.fiyatMax).toLocaleString('tr-TR')})
    if (data.kategori==='emlak') {
      if (data.emlakTip) s.push({l:'Tür',v:data.emlakTip})
      if (data.m2Min||data.m2Max) s.push({l:'m²',v:data.m2Min+' – '+data.m2Max+' m²'})
      if (data.oda.length) s.push({l:'Oda',v:data.oda.join(', ')})
    }
    if (data.kategori==='vasita') {
      if (data.vasitaMarka) s.push({l:'Araç',v:[data.vasitaMarka,data.vasitaModel,data.vasitaVersiyon].filter(Boolean).join(' ')})
      else if (data.markalar.length) s.push({l:'Marka',v:data.markalar.join(', ')})
      if (data.yilMin||data.yilMax) s.push({l:'Yıl',v:data.yilMin+' – '+data.yilMax})
      if (data.kmMax) s.push({l:'Max KM',v:Number(data.kmMax).toLocaleString('tr-TR')+' km'})
    }
    if (data.aciklama) s.push({l:'Açıklama',v:data.aciklama.slice(0,80)+(data.aciklama.length>80?'…':'')})
    s.push({l:'İletişim', v:data.iletisimTercihi==='mesaj'?'💬 Sadece mesaj':'📞 Mesaj + Telefon'})
    return s
  }

  if (!open) return null
  const gecerli = validate(step, data, giris)
  const onayAdimi = step === TOPLAM
  const fiyatlar = getFiyatlar()

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>

        {/* HEADER */}
        <div className={styles.boxTop}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <h2 className={styles.title}>{done ? 'İlanınız alındı! 📨' : STEPS[step-1]}</h2>
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
              <h3>İlanınız onaya gönderildi!</h3>
              <p style={{lineHeight:1.6}}>İlanınız <strong>onay bekliyor</strong>. Yönetici onayından sonra kısa sürede yayına alınacak ve satıcılar size ulaşabilecek. Genellikle birkaç saat içinde cevap verilir.</p>
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
                  {/* Seçim yolu (breadcrumb) */}
                  {katYol.length > 0 && (
                    <div className={styles.katBreadcrumb}>
                      <button className={styles.katBcRoot} onClick={() => { setKatYol([]); set('kategori',''); set('altKategori',''); set('altKategori2',''); set('vasitaMarka',''); set('vasitaModel','') }}>
                        🏠 Başa dön
                      </button>
                      {katYol.map((k, i) => (
                        <span key={k.id || k.slug} className={styles.katBcItem}>
                          <span className={styles.katBcSep}>›</span>
                          <button onClick={() => {
                            const yeniYol = katYol.slice(0, i+1)
                            setKatYol(yeniYol)
                          }}>{k.label}</button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mevcut seviyedeki kategoriler */}
                  <div className={styles.katBaslik2}>
                    {katYol.length === 0 ? 'Ne almak istiyorsunuz?' : `${katYol[katYol.length-1].label} içinde seçin`}
                  </div>

                  {aktifKatListesi.length > 0 ? (
                    <div className={styles.katGrid2}>
                      {aktifKatListesi.map(k => {
                        const cocukVar = k.altKategoriler && k.altKategoriler.length > 0
                        return (
                          <button key={k.id || k.slug}
                            className={styles.katKart2}
                            onClick={() => katSec(k)}>
                            {k.icon && <span className={styles.katKart2Icon}>{k.icon}</span>}
                            <span className={styles.katKart2Label}>{k.label}</span>
                            {cocukVar
                              ? <span className={styles.katKart2Ok}>›</span>
                              : <span className={styles.katKart2Sec}>Seç →</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    /* Alt kategori yok = en dip seviye → bu kategoriyle devam */
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


              {/* ADIM 2: KONUM */}
              {step === 2 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">İşlem türü</label>
                    <div className={styles.optGrid2}>
                      {[{v:'satin-al',i:'🛒',l:'Satın almak'},{v:'kirala',i:'🔑',l:'Kiralamak'}].map(o => (
                        <button key={o.v} className={`${styles.optBtn} ${data.islemTuru===o.v?styles.optSel:''}`}
                          onClick={() => set('islemTuru',o.v)}>
                          <span className={styles.optIcon}>{o.i}</span>
                          <span className={styles.optLabel}>{o.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Şehir *</label>
                    <select className="form-select" value={data.sehir}
                      onChange={e => { set('sehir',e.target.value); set('ilce','') }}>
                      <option value="">Şehir seçin</option>
                      {sehirler.map(s => <option key={s.il} value={s.il}>{s.il}</option>)}
                    </select>
                  </div>
                  {data.sehir && (
                    <div className={styles.fieldGroup}>
                      <label className="form-label">İlçe (isteğe bağlı)</label>
                      <select className="form-select" value={data.ilce} onChange={e => set('ilce',e.target.value)}>
                        <option value="">Tüm ilçeler</option>
                        {getIlceler(data.sehir).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 3: FİYAT & ÖZELLİKLER */}
              {step === 3 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Bütçe aralığı (₺) *</label>
                    <div className={styles.rangeRow}>
                      <select className="form-select" style={{flex:1}} value={data.fiyatMin}
                        onChange={e => set('fiyatMin', e.target.value)}>
                        <option value="">En az</option>
                        {fiyatlar.map(f => <option key={f} value={f}>₺{f.toLocaleString('tr-TR')}</option>)}
                      </select>
                      <span className={styles.rangeSep}>—</span>
                      <select className="form-select" style={{flex:1}} value={data.fiyatMax}
                        onChange={e => set('fiyatMax', e.target.value)}>
                        <option value="">En fazla</option>
                        {fiyatlar.filter(f => !data.fiyatMin || f > Number(data.fiyatMin)).map(f => (
                          <option key={f} value={f}>₺{f.toLocaleString('tr-TR')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* EMLAK */}
                  {data.kategori === 'emlak' && <>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Emlak tipi *</label>
                      <div className={styles.chipGroup}>
                        {emlakTipler.map(t => (
                          <button key={t} className={`${styles.chip} ${data.emlakTip===t?styles.chipSel:''}`}
                            onClick={() => set('emlakTip',t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Metrekare aralığı *</label>
                      <div className={styles.rangeRow}>
                        <select className="form-select" style={{flex:1}} value={data.m2Min} onChange={e => set('m2Min',e.target.value)}>
                          <option value="">En az m²</option>
                          {M2_SECENEKLER.map(m => <option key={m} value={m}>{m} m²</option>)}
                        </select>
                        <span className={styles.rangeSep}>—</span>
                        <select className="form-select" style={{flex:1}} value={data.m2Max} onChange={e => set('m2Max',e.target.value)}>
                          <option value="">En fazla m²</option>
                          {M2_SECENEKLER.filter(m => !data.m2Min || m > Number(data.m2Min)).map(m => <option key={m} value={m}>{m} m²</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Oda sayısı *</label>
                      <div className={styles.chipGroup}>
                        {odaSayilari.map(o => (
                          <button key={o} className={`${styles.chip} ${data.oda.includes(o)?styles.chipSel:''}`}
                            onClick={() => toggle('oda',o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Özellikler</label>
                      <div className={styles.chipGroup}>
                        {emlakOzellikleri.map(t => (
                          <button key={t} className={`${styles.chip} ${data.tercihler.includes(t)?styles.chipSel:''}`}
                            onClick={() => toggle('tercihler',t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {/* VASITA */}
                  {data.kategori === 'vasita' && <>
                    {data.vasitaMarka ? (
                      <div className={styles.fieldGroup}>
                        <div style={{background:'#E6F5F2',border:'1px solid #B2DDD7',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:'#085549',marginBottom:2}}>✓ Araç Seçimi (Adım 1'den)</div>
                            <div style={{fontSize:14,fontWeight:700,color:'#085549'}}>
                              {data.vasitaMarka} {data.vasitaModel||''} {data.vasitaVersiyon||''}
                            </div>
                          </div>
                          <button onClick={() => { set('vasitaMarka',''); set('vasitaModel',''); set('vasitaVersiyon','') }}
                            style={{fontSize:11,color:'#8a95a3',background:'none',border:'1px solid #e2e8f0',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontFamily:'inherit'}}>
                            Değiştir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.fieldGroup}>
                        <label className="form-label">Marka tercihleri</label>
                        <div className={styles.chipGroup}>
                          {vasitaMarkalar.map(m => (
                            <button key={m} className={`${styles.chip} ${data.markalar.includes(m)?styles.chipSel:''}`}
                              onClick={() => toggle('markalar',m)}>{m}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Model yılı aralığı *</label>
                      <div className={styles.rangeRow}>
                        <select className="form-select" style={{flex:1}} value={data.yilMin} onChange={e => set('yilMin',e.target.value)}>
                          <option value="">En eski yıl</option>
                          {YIL_SECENEKLER.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className={styles.rangeSep}>—</span>
                        <select className="form-select" style={{flex:1}} value={data.yilMax} onChange={e => set('yilMax',e.target.value)}>
                          <option value="">En yeni yıl</option>
                          {YIL_SECENEKLER.filter(y => !data.yilMin || y >= Number(data.yilMin)).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Maksimum KM</label>
                      <select className="form-select" value={data.kmMax} onChange={e => set('kmMax',e.target.value)}>
                        <option value="">Fark etmez</option>
                        {KM_SECENEKLER.filter(k=>k>0).map(k => <option key={k} value={k}>{k.toLocaleString('tr-TR')} km</option>)}
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Yakıt tipi</label>
                      <div className={styles.chipGroup}>
                        {yakitTipleri.map(y => <button key={y} className={`${styles.chip} ${data.yakit.includes(y)?styles.chipSel:''}`} onClick={() => toggle('yakit',y)}>{y}</button>)}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Vites tipi</label>
                      <div className={styles.chipGroup}>
                        {vitesTipleri.map(v => <button key={v} className={`${styles.chip} ${data.vites.includes(v)?styles.chipSel:''}`} onClick={() => toggle('vites',v)}>{v}</button>)}
                      </div>
                    </div>
                  </>}

                  {!gecerli && (
                    <div className={styles.zorunluUyari}>
                      {(!data.fiyatMin || !data.fiyatMax) && <span>• Bütçe aralığı seçin</span>}
                      {data.kategori==='emlak' && !data.emlakTip && <span>• Emlak tipi seçin</span>}
                      {data.kategori==='emlak' && (!data.m2Min||!data.m2Max) && <span>• Metrekare aralığı seçin</span>}
                      {data.kategori==='emlak' && data.oda.length===0 && <span>• Oda sayısı seçin</span>}
                      {data.kategori==='vasita' && (!data.yilMin||!data.yilMax) && <span>• Model yılı seçin</span>}
                    </div>
                  )}
                </div>
              )}

              {/* ADIM 4: AÇIKLAMA */}
              {step === 4 && (
                <div className={styles.fieldGroup}>
                  <label className="form-label">
                    Açıklama
                    <span style={{fontWeight:400,color:data.aciklama.trim().length>=10?'#38A169':'#E53E3E',marginLeft:8,fontSize:11}}>
                      {data.aciklama.trim().length}/10 min{data.aciklama.trim().length>=10?' ✓':''}
                    </span>
                  </label>
                  <textarea className="form-input" rows={5}
                    placeholder="Örn: Ocak ayına kadar taşınmam gerekiyor. Balkon ve asansör şart."
                    style={{resize:'vertical',lineHeight:1.6}}
                    value={data.aciklama} onChange={e => set('aciklama',e.target.value)} />
                  <p className={styles.hint}>Detay verdikçe daha doğru eşleşme sağlanır.</p>
                </div>
              )}

              {/* ADIM 5: İLETİŞİM */}
              {step === 5 && (
                <div>
                  <p style={{fontSize:14,color:'#4a5568',marginBottom:16,lineHeight:1.7}}>
                    Satıcılar size nasıl ulaşsın? <strong>💬 Mesaj her zaman açık</strong> kalır.
                  </p>
                  <div className={styles.iletisimKartlar}>
                    <button className={`${styles.iletisimKart} ${data.iletisimTercihi==='mesaj'?styles.iletisimSel:''}`}
                      onClick={() => set('iletisimTercihi','mesaj')}>
                      <div className={styles.iletisimUst}><span className={styles.iletisimIcon}>💬</span></div>
                      <div className={styles.iletisimBaslik}>Sadece Mesaj</div>
                      <div className={styles.iletisimAcik}>Telefon numaranız <strong>gizli</strong> kalır.</div>
                      <div className={styles.iletisimTag}>🔒 Telefonunuz kimseye gösterilmez</div>
                    </button>
                    <button className={`${styles.iletisimKart} ${data.iletisimTercihi==='telefon'?styles.iletisimSel:''}`}
                      onClick={() => set('iletisimTercihi','telefon')}>
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

              {/* ADIM 6 MİSAFİR: KİŞİSEL BİLGİ */}
              {step === 6 && !giris && (
                <div>
                  <div className={styles.privacyBox}>
                    <div className={styles.privacyIcon}>🔒</div>
                    <div><strong>Bilgileriniz korunuyor</strong>
                      <p>Yalnızca adınız ve soyad baş harfiniz görünür.</p></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div><label className="form-label">Adınız *</label>
                      <input className="form-input" placeholder="Mehmet" value={data.ad} onChange={e => set('ad',e.target.value)} /></div>
                    <div><label className="form-label">Soyadınız</label>
                      <input className="form-input" placeholder="Yılmaz" value={data.soyad} onChange={e => set('soyad',e.target.value)} /></div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Telefon *</label>
                    <div style={{display:'flex'}}>
                      <span style={{display:'flex',alignItems:'center',padding:'0 10px',background:'#f7f8fa',border:'1.5px solid #e2e8f0',borderRight:'none',borderRadius:'9px 0 0 9px',fontSize:13,color:'#4a5568',fontWeight:500}}>+90</span>
                      <input className="form-input" type="tel" style={{borderRadius:'0 9px 9px 0',borderLeft:'none'}}
                        placeholder="532 000 00 00" value={data.telefon}
                        onChange={e => set('telefon',e.target.value.replace(/[^0-9 ]/g,'').replace(/^0/,''))} />
                    </div>
                  </div>
                </div>
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

        {/* FOOTER — kategori adımında (step 1) gizli, kullanıcı kart seçerek ilerler */}
        {!done && step > 1 && (
          <div className={styles.boxFooter}>
            <button className="btn-ghost" onClick={geri}>← Geri</button>
            {onayAdimi ? (
              <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={handleSubmit}>
                ✓ İlanı Yayınla
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
