import { useState, useRef, useEffect } from 'react'
import { sehirler, getIlceler } from '../data/sehirler'
import { KATEGORILER } from '../data/kategoriler'
import styles from './IlanForm.module.css'

// ==================== SABİT VERİLER ====================
const STEPS_GIRIS   = ['Kategori','Konum','Fiyat & Özellikler','Açıklama','İletişim','Onay']
const STEPS_MISAFIR = ['Kategori','Konum','Fiyat & Özellikler','Açıklama','İletişim','Kişisel Bilgi','Onay']

const kategoriler = [
  {slug:'emlak',    icon:'🏠', label:'Emlak',   sub:'Daire, villa, arsa…'},
  {slug:'vasita',   icon:'🚗', label:'Vasıta',  sub:'Otomobil, SUV, motosiklet…'},
  {slug:'ikinci-el',icon:'📦', label:'İkinci El',sub:'Genel eşya, ürün…'},
  {slug:'mobilya',  icon:'🛋️', label:'Mobilya', sub:'Koltuk, masa, yatak…'},
  {slug:'elektronik',icon:'📱',label:'Elektronik',sub:'Telefon, bilgisayar…'},
  {slug:'sanayi',   icon:'🏭', label:'Sanayi',  sub:'Makine, ekipman…'},
]
const emlakTipler   = ['Daire','Villa','Müstakil Ev','Arsa','İşyeri','Depo','Tarla']
const odaSayilari   = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
const emlakOzellikleri = ['Asansör','Otopark','Balkon','Bahçe','Güvenlik','Eşyalı','Site içi','Deniz manzarası']
const vasitaMarkalar= ['Audi','BMW','Citroen','Fiat','Ford','Honda','Hyundai','Kia','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo','Diğer']
const yakitTipleri  = ['Benzin','Dizel','LPG','Hibrit','Elektrikli','Fark etmez']
const vitesTipleri  = ['Otomatik','Manuel','Yarı Otomatik','Fark etmez']

// ==================== EMLAK FİYAT SEÇENEKLER ====================
const EMLAK_KIRA_FIYATLAR = [5000,8000,10000,12000,15000,18000,20000,22000,25000,28000,30000,35000,40000,45000,50000,60000,75000,100000]
const EMLAK_SATIS_FIYATLAR = [500000,750000,1000000,1250000,1500000,1750000,2000000,2500000,3000000,3500000,4000000,5000000,6000000,7500000,10000000,15000000,20000000,25000000]
const VASITA_FIYATLAR = [100000,150000,200000,250000,300000,350000,400000,450000,500000,600000,700000,800000,900000,1000000,1250000,1500000,1750000,2000000,2500000,3000000]
const GENEL_FIYATLAR = [1000,2000,5000,10000,15000,20000,30000,50000,75000,100000,150000,200000,300000,500000]

// m² seçenekleri: 25'er artış
const M2_SECENEKLER = Array.from({length:28}, (_,i) => (i+1)*25) // 25,50,75,...,700

// Araç km seçenekleri: 5000'er artış
const KM_SECENEKLER = [0,5000,10000,20000,30000,40000,50000,60000,70000,80000,90000,100000,120000,150000,200000,250000]

// Araç yıl seçenekleri
const YIL_SECENEKLER = Array.from({length:14}, (_,i) => 2010+i) // 2010-2023

function formatFiyat(val) {
  if (!val) return ''
  return Number(val).toLocaleString('tr-TR')
}

const katLabels = {emlak:'Emlak',vasita:'Vasıta','ikinci-el':'İkinci El',mobilya:'Mobilya',elektronik:'Elektronik',sanayi:'Sanayi'}

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
    case 5: return !!data.iletisimTercihi // her zaman seçili
    case 6:
      if (giris) return true
      return !!(data.ad && data.telefon && data.telefon.replace(/\D/g,'').length >= 10)
    default: return true
  }
}

export default function IlanForm({ open, onClose, onSubmit, user }) {
  const giris = !!user
  const STEPS = giris ? STEPS_GIRIS : STEPS_MISAFIR
  const TOPLAM = STEPS.length

  const bodyRef = useRef(null)
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [data, setData] = useState({
    kategori:'', altKategori:'', islemTuru:'satin-al', sehir:'', ilce:'',
    fiyatMin:'', fiyatMax:'',
    emlakTip:'', m2Min:'', m2Max:'', oda:[], tercihler:[],
    markalar:[], yilMin:'', yilMax:'', kmMax:'', yakit:[], vites:[],
    aciklama:'', iletisimTercihi:'mesaj', ad:'', soyad:'', telefon:'',
  })

  const set = (k,v) => setData(d => ({...d,[k]:v}))
  const toggle = (k,v) => setData(d => ({...d,[k]: d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]}))

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0 }, [step])

  function ileri() {
    if (!validate(step, data, giris)) return
    if (step < TOPLAM) setStep(s => s+1)
  }

  function geri() { if (step > 1) setStep(s => s-1) }

  function handleSubmit() {
    const final = giris
      ? {...data, ad:user.ad, soyad:user.soyad, telefon:user.telefon, iletisimTercihi:data.iletisimTercihi}
      : data
    onSubmit && onSubmit(final)
    setDone(true)
  }

  function reset() {
    setStep(1); setDone(false)
    setData({kategori:'',altKategori:'',islemTuru:'satin-al',sehir:'',ilce:'',fiyatMin:'',fiyatMax:'',
      emlakTip:'',m2Min:'',m2Max:'',oda:[],tercihler:[],
      markalar:[],yilMin:'',yilMax:'',kmMax:'',yakit:[],vites:[],
      aciklama:'',iletisimTercihi:'mesaj',ad:'',soyad:'',telefon:''})
  }

  function getFiyatlar() {
    if (data.kategori === 'emlak') return data.islemTuru === 'kirala' ? EMLAK_KIRA_FIYATLAR : EMLAK_SATIS_FIYATLAR
    if (data.kategori === 'vasita') return VASITA_FIYATLAR
    return GENEL_FIYATLAR
  }

  function ozetSatirlar() {
    const s = []
    s.push({l:'Kategori', v:katLabels[data.kategori]||data.kategori})
    s.push({l:'İşlem', v:data.islemTuru==='satin-al'?'Satın almak':'Kiralamak'})
    if (data.sehir) s.push({l:'Konum', v:data.sehir+(data.ilce?' / '+data.ilce:'')})
    if (data.fiyatMin||data.fiyatMax) s.push({l:'Bütçe', v:'₺'+formatFiyat(data.fiyatMin)+' – ₺'+formatFiyat(data.fiyatMax)})
    if (data.kategori==='emlak') {
      if (data.emlakTip) s.push({l:'Tür',v:data.emlakTip})
      if (data.m2Min||data.m2Max) s.push({l:'m²',v:data.m2Min+' – '+data.m2Max+' m²'})
      if (data.oda.length) s.push({l:'Oda',v:data.oda.join(', ')})
      if (data.tercihler.length) s.push({l:'Özellikler',v:data.tercihler.join(', ')})
    }
    if (data.kategori==='vasita') {
      if (data.markalar.length) s.push({l:'Marka',v:data.markalar.join(', ')})
      if (data.yilMin||data.yilMax) s.push({l:'Yıl',v:data.yilMin+' – '+data.yilMax})
      if (data.kmMax) s.push({l:'Max KM',v:Number(data.kmMax).toLocaleString('tr-TR')+' km'})
      if (data.yakit.length) s.push({l:'Yakıt',v:data.yakit.join(', ')})
      if (data.vites.length) s.push({l:'Vites',v:data.vites.join(', ')})
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

        {/* SABİT HEADER */}
        <div className={styles.boxTop}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <h2 className={styles.title}>{done ? 'İlanınız yayında! 🎉' : STEPS[step-1]}</h2>
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

        {/* SCROLL BODY */}
        <div className={styles.boxBody} ref={bodyRef}>

          {done ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>🎉</div>
              <h3>İlanınız yayında!</h3>
              <p>Talebiniz satıcılara ulaştı.</p>
              <div className={styles.successInfo}>
                <p>🔒 Telefon numaranız gizlidir</p>
                <p>👤 Yalnızca adınız ve soyad baş harfiniz görünür</p>
                {data.iletisimTercihi==='telefon' && <p>📞 Telefon numaranız satıcılara görünür</p>}
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}}
                onClick={() => { reset(); onClose() }}>Tamam ✓</button>
            </div>
          ) : (
            <>
              {/* ADIM 1: KATEGORİ */}
              {step===1 && (
                <div>
                  {KATEGORILER.map(ana => (
                    <div key={ana.slug} style={{marginBottom:16}}>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6,paddingLeft:2}}>
                        {ana.icon} {ana.label}
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        <button
                          className={`${styles.chip} ${data.kategori===ana.slug&&!data.altKategori?styles.chipSel:''}`}
                          onClick={() => { set('kategori',ana.slug); set('altKategori','') }}>
                          Tümü
                        </button>
                        {ana.altKategoriler?.map(alt => (
                          <button key={alt.slug}
                            className={`${styles.chip} ${data.altKategori===alt.slug?styles.chipSel:''}`}
                            onClick={() => { set('kategori',ana.slug); set('altKategori',alt.slug) }}>
                            {alt.icon} {alt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ADIM 2: KONUM */}
              {step===2 && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">İşlem türü</label>
                    <div className={styles.optGrid2}>
                      {[{v:'satin-al',i:'💰',l:'Satın almak'},{v:'kirala',i:'🔑',l:'Kiralamak'}].map(o => (
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
              {step===3 && (
                <div>
                  {/* BÜTÇE — dropdown seçimi */}
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Bütçe aralığı (₺) *</label>
                    <div className={styles.rangeRow}>
                      <select className="form-select" style={{flex:1}}
                        value={data.fiyatMin}
                        onChange={e => set('fiyatMin', e.target.value)}>
                        <option value="">En az</option>
                        {fiyatlar.map(f => (
                          <option key={f} value={f}>₺{f.toLocaleString('tr-TR')}</option>
                        ))}
                      </select>
                      <span className={styles.rangeSep}>—</span>
                      <select className="form-select" style={{flex:1}}
                        value={data.fiyatMax}
                        onChange={e => set('fiyatMax', e.target.value)}>
                        <option value="">En fazla</option>
                        {fiyatlar.filter(f => !data.fiyatMin || f > Number(data.fiyatMin)).map(f => (
                          <option key={f} value={f}>₺{f.toLocaleString('tr-TR')}</option>
                        ))}
                      </select>
                    </div>
                    {data.fiyatMin && data.fiyatMax && Number(data.fiyatMin) >= Number(data.fiyatMax) && (
                      <p style={{color:'var(--red)',fontSize:11,marginTop:4}}>⚠️ Min değer maksimumdan küçük olmalı</p>
                    )}
                  </div>

                  {/* EMLAK ÖZELLİKLERİ */}
                  {data.kategori==='emlak' && <>
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
                      <label className="form-label">Metrekare aralığı (m²) * <span style={{fontWeight:400,fontSize:11,color:'var(--text-3)'}}>25 m² aralıklarla</span></label>
                      <div className={styles.rangeRow}>
                        <select className="form-select" style={{flex:1}} value={data.m2Min}
                          onChange={e => set('m2Min', e.target.value)}>
                          <option value="">En az m²</option>
                          {M2_SECENEKLER.map(m => <option key={m} value={m}>{m} m²</option>)}
                        </select>
                        <span className={styles.rangeSep}>—</span>
                        <select className="form-select" style={{flex:1}} value={data.m2Max}
                          onChange={e => set('m2Max', e.target.value)}>
                          <option value="">En fazla m²</option>
                          {M2_SECENEKLER.filter(m => !data.m2Min || m > Number(data.m2Min)).map(m => (
                            <option key={m} value={m}>{m} m²</option>
                          ))}
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

                  {/* VASITA ÖZELLİKLERİ */}
                  {data.kategori==='vasita' && <>
                    <div className={styles.fieldGroup}>
                      <label className="form-label">Marka tercihleri</label>
                      <div className={styles.chipGroup}>
                        {vasitaMarkalar.map(m => (
                          <button key={m} className={`${styles.chip} ${data.markalar.includes(m)?styles.chipSel:''}`}
                            onClick={() => toggle('markalar',m)}>{m}</button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className="form-label">Model yılı aralığı *</label>
                      <div className={styles.rangeRow}>
                        <select className="form-select" style={{flex:1}} value={data.yilMin}
                          onChange={e => set('yilMin', e.target.value)}>
                          <option value="">En eski yıl</option>
                          {YIL_SECENEKLER.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className={styles.rangeSep}>—</span>
                        <select className="form-select" style={{flex:1}} value={data.yilMax}
                          onChange={e => set('yilMax', e.target.value)}>
                          <option value="">En yeni yıl</option>
                          {YIL_SECENEKLER.filter(y => !data.yilMin || y >= Number(data.yilMin)).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className="form-label">Maksimum KM <span style={{fontWeight:400,fontSize:11,color:'var(--text-3)'}}>5.000 km aralıklarla</span></label>
                      <select className="form-select" value={data.kmMax}
                        onChange={e => set('kmMax', e.target.value)}>
                        <option value="">Fark etmez</option>
                        {KM_SECENEKLER.filter(k=>k>0).map(k => (
                          <option key={k} value={k}>{k.toLocaleString('tr-TR')} km</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className="form-label">Yakıt tipi</label>
                      <div className={styles.chipGroup}>
                        {yakitTipleri.map(y => (
                          <button key={y} className={`${styles.chip} ${data.yakit.includes(y)?styles.chipSel:''}`}
                            onClick={() => toggle('yakit',y)}>{y}</button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className="form-label">Vites tipi</label>
                      <div className={styles.chipGroup}>
                        {vitesTipleri.map(v => (
                          <button key={v} className={`${styles.chip} ${data.vites.includes(v)?styles.chipSel:''}`}
                            onClick={() => toggle('vites',v)}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </>}

                  {/* ZORUNLU UYARI */}
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
              {step===4 && (
                <div className={styles.fieldGroup}>
                  <label className="form-label">
                    Açıklama
                    <span style={{fontWeight:400,color:data.aciklama.trim().length>=10?'var(--green)':'var(--red)',marginLeft:8,fontSize:11}}>
                      {data.aciklama.trim().length}/10 min{data.aciklama.trim().length>=10?' ✓':''}
                    </span>
                  </label>
                  <textarea className="form-input" rows={5}
                    placeholder="Örn: Ocak ayına kadar taşınmam gerekiyor. Balkon ve asansör şart. Hafta sonu görüşmeye uygunum."
                    style={{resize:'vertical',lineHeight:1.6,borderColor:data.aciklama.length>0&&data.aciklama.trim().length<10?'var(--red)':undefined}}
                    value={data.aciklama} onChange={e => set('aciklama',e.target.value)} />
                  {data.aciklama.length>0 && data.aciklama.trim().length<10 && (
                    <p style={{color:'var(--red)',fontSize:11,marginTop:4}}>⚠️ En az 10 karakter ({10-data.aciklama.trim().length} daha)</p>
                  )}
                  <p className={styles.hint}>Detay verdikçe daha doğru eşleşme sağlanır.</p>
                </div>
              )}

              {/* ADIM 5: İLETİŞİM TERCİHİ — her zaman bu adım */}
              {step===5 && (
                <div>
                  <p style={{fontSize:14,color:'var(--text-2)',marginBottom:16,lineHeight:1.7}}>
                    Satıcılar size nasıl ulaşsın? <strong>💬 Mesaj her zaman açık</strong> kalır. Telefon eklemek daha hızlı iletişim sağlar.
                  </p>

                  <div className={styles.iletisimKartlar}>
                    {/* SADECE MESAJ */}
                    <button
                      className={`${styles.iletisimKart} ${data.iletisimTercihi==='mesaj'?styles.iletisimSel:''}`}
                      onClick={() => set('iletisimTercihi','mesaj')}>
                      <div className={styles.iletisimUst}>
                        <span className={styles.iletisimIcon}>💬</span>
                      </div>
                      <div className={styles.iletisimBaslik}>Sadece Mesaj</div>
                      <div className={styles.iletisimAcik}>Satıcılar platform üzerinden mesaj gönderir. Telefon numaranız <strong>gizli</strong> kalır.</div>
                      <div className={styles.iletisimTag}>🔒 Telefonunuz kimseye gösterilmez</div>
                    </button>

                    {/* MESAJ + TELEFON — ÖNERİLEN */}
                    <button
                      className={`${styles.iletisimKart} ${data.iletisimTercihi==='telefon'?styles.iletisimSel:''}`}
                      onClick={() => set('iletisimTercihi','telefon')}>
                      <div className={styles.iletisimUst}>
                        <span className={styles.iletisimIcon}>📞</span>
                        <span className={`${styles.iletisimOneri} ${data.iletisimTercihi==='telefon'?styles.iletisimOneriSel:''}`}>ÖNERİLEN</span>
                      </div>
                      <div className={styles.iletisimBaslik}>Mesaj + Telefon</div>
                      <div className={styles.iletisimAcik}>Hem mesaj hem telefon açık olur. Acil ihtiyaçlarda satıcılar sizi <strong>doğrudan arayabilir</strong>.</div>
                      <div className={styles.iletisimTag} style={{background:'#DCFCE7',color:'#15803D'}}>⚡ Daha hızlı iletişim</div>
                    </button>
                  </div>

                  <div className={styles.iletisimNot}>
                    {data.iletisimTercihi === 'mesaj'
                      ? '💬 Satıcılar size platform üzerinden mesaj gönderir. Telefon numaranız kimseye gösterilmez.'
                      : '📞 Satıcılar hem mesaj gönderebilir hem de telefon numaranızı görebilir. İstediğiniz zaman ayarlardan değiştirebilirsiniz.'
                    }
                  </div>
                </div>
              )}

              {/* ADIM 6 MİSAFİR: KİŞİSEL BİLGİ */}
              {step===6 && !giris && (
                <div>
                  <div className={styles.privacyBox}>
                    <div className={styles.privacyIcon}>🔒</div>
                    <div>
                      <strong>Bilgileriniz korunuyor</strong>
                      <p>Yalnızca adınız ve soyad baş harfiniz görünür.</p>
                    </div>
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
                      <span style={{display:'flex',alignItems:'center',padding:'0 10px',background:'var(--bg)',border:'1.5px solid var(--border)',borderRight:'none',borderRadius:'9px 0 0 9px',fontSize:13,color:'var(--text-2)',fontWeight:500}}>+90</span>
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
                        <div className={styles.kullaniciAlt}>
                          <span>📧 {user.email}</span>
                          {user.telefon && <span>📞 +90 {user.telefon}</span>}
                        </div>
                      </div>
                      <div className={styles.gizliTag}>
                        {data.iletisimTercihi==='mesaj' ? '💬 Sadece mesaj' : '📞 Mesaj + Tel'}
                      </div>
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

        {/* SABİT FOOTER */}
        {!done && (
          <div className={styles.boxFooter}>
            {step > 1 ? (
              <button className="btn-ghost" onClick={geri}>← Geri</button>
            ) : <div />}
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
