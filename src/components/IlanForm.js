import { useState } from 'react'
import { sehirler, getIlceler } from '../data/sehirler'
import styles from './IlanForm.module.css'

const STEPS = [
  { id: 1, title: 'Ne arıyorsunuz?' },
  { id: 2, title: 'Konum ve işlem türü' },
  { id: 3, title: 'Fiyat ve özellikler' },
  { id: 4, title: 'Kısa açıklama' },
  { id: 5, title: 'İletişim bilgileri' },
]

const kategoriler = [
  { slug: 'emlak', icon: '🏠', label: 'Emlak', sub: 'Daire, villa, arsa…' },
  { slug: 'vasita', icon: '🚗', label: 'Vasıta', sub: 'Otomobil, SUV, motosiklet…' },
  { slug: 'ikinci-el', icon: '📦', label: 'İkinci El', sub: 'Genel eşya, ürün…' },
  { slug: 'mobilya', icon: '🛋️', label: 'Mobilya', sub: 'Koltuk, masa, yatak…' },
  { slug: 'elektronik', icon: '📱', label: 'Elektronik', sub: 'Telefon, bilgisayar…' },
  { slug: 'is-makinasi', icon: '🔧', label: 'İş Makinası', sub: 'Traktör, forklift…' },
]

const emlakTipler = ['Daire','Villa','Müstakil Ev','Arsa','İşyeri','Depo','Tarla']
const odaSayilari = ['1+0','1+1','2+1','3+1','4+1','4+1 ve üzeri','Fark etmez']
const emlakTercihler = ['Asansör','Otopark','Balkon','Bahçe','Güvenlik','Eşyalı','Site içi','Deniz manzarası']

const vasitaMarkalar = ['Audi','BMW','Citroen','Fiat','Ford','Honda','Hyundai','Kia','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo','Diğer']
const yakitTipleri = ['Benzin','Dizel','LPG','Hibrit','Elektrikli','Fark etmez']
const vitesTipleri = ['Otomatik','Manuel','Yarı Otomatik','Fark etmez']

export default function IlanForm({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [data, setData] = useState({
    kategori: '', islemTuru: 'satin-al',
    sehir: '', ilce: '',
    fiyatMin: '', fiyatMax: '',
    // emlak
    emlakTip: '', m2Min: '', m2Max: '', oda: [], tercihler: [],
    // vasita
    markalar: [], yilMin: '', yilMax: '', kmMin: '', kmMax: '', yakit: [], vites: [],
    // common
    aciklama: '', ad: '', telefon: '',
  })

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))
  const toggle = (key, val) => setData(d => {
    const arr = d[key] || []
    return { ...d, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
  })

  function handleSubmit() {
    onSubmit && onSubmit(data)
    setDone(true)
  }

  function reset() {
    setStep(1); setDone(false)
    setData({ kategori:'', islemTuru:'satin-al', sehir:'', ilce:'', fiyatMin:'', fiyatMax:'',
      emlakTip:'', m2Min:'', m2Max:'', oda:[], tercihler:[],
      markalar:[], yilMin:'', yilMax:'', kmMin:'', kmMax:'', yakit:[], vites:[],
      aciklama:'', ad:'', telefon:'' })
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{done ? 'İlanınız yayında!' : STEPS[step-1]?.title}</h2>
            {!done && <p className={styles.sub}>Adım {step} / {STEPS.length}</p>}
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        {!done && (
          <div className={styles.progress}>
            {STEPS.map(s => (
              <div key={s.id} className={`${styles.prog} ${step > s.id ? styles.progDone : ''} ${step === s.id ? styles.progActive : ''}`} />
            ))}
          </div>
        )}

        {done ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h3>İlanınız yayında!</h3>
            <p>Talebiniz binlerce emlakçı ve galericiye ulaştı.<br/>Uygun satıcılar size ulaşacak.</p>
            <div className={styles.successInfo}>
              <p>🔒 Telefon numaranız sadece siz onay verince açılır</p>
              <p>👤 Yalnızca adınız ve soyad baş harfiniz görünür</p>
              <p>📩 İlanınıza satıcılar baktığında SMS ile haber vereceğiz</p>
            </div>
            <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={() => { reset(); onClose(); }}>
              Tamam, harika!
            </button>
          </div>
        ) : (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div className={styles.optGrid}>
                  {kategoriler.map(k => (
                    <button key={k.slug}
                      className={`${styles.optBtn} ${data.kategori === k.slug ? styles.optSel : ''}`}
                      onClick={() => set('kategori', k.slug)}>
                      <span className={styles.optIcon}>{k.icon}</span>
                      <span className={styles.optLabel}>{k.label}</span>
                      <span className={styles.optSub}>{k.sub}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.footer}>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    disabled={!data.kategori} onClick={() => setStep(2)}>
                    Devam et →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">İşlem türü</label>
                  <div className={styles.optGrid2}>
                    {[{v:'satin-al',icon:'🔑',l:'Satın almak'},{v:'kirala',icon:'📋',l:'Kiralamak'}].map(o => (
                      <button key={o.v}
                        className={`${styles.optBtn} ${data.islemTuru === o.v ? styles.optSel : ''}`}
                        onClick={() => set('islemTuru', o.v)}>
                        <span className={styles.optIcon}>{o.icon}</span>
                        <span className={styles.optLabel}>{o.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className="form-label">Şehir</label>
                  <select className="form-select" value={data.sehir}
                    onChange={e => { set('sehir', e.target.value); set('ilce', '') }}>
                    <option value="">Şehir seçin</option>
                    {sehirler.map(s => (
                      <option key={s.il} value={s.il}>{s.il}</option>
                    ))}
                  </select>
                </div>

                {data.sehir && (
                  <div className={styles.fieldGroup}>
                    <label className="form-label">İlçe (isteğe bağlı)</label>
                    <select className="form-select" value={data.ilce}
                      onChange={e => set('ilce', e.target.value)}>
                      <option value="">Tüm ilçeler</option>
                      {getIlceler(data.sehir).map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(1)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    disabled={!data.sehir} onClick={() => setStep(3)}>
                    Devam et →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Bütçe aralığı (₺)</label>
                  <div className={styles.rangeRow}>
                    <input className="form-input" placeholder="En az (örn. 500.000)" value={data.fiyatMin}
                      onChange={e => set('fiyatMin', e.target.value)} />
                    <span className={styles.rangeSep}>—</span>
                    <input className="form-input" placeholder="En fazla (örn. 1.500.000)" value={data.fiyatMax}
                      onChange={e => set('fiyatMax', e.target.value)} />
                  </div>
                </div>

                {/* EMLAK FIELDS */}
                {data.kategori === 'emlak' && <>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Emlak tipi</label>
                    <div className={styles.chipGroup}>
                      {emlakTipler.map(t => (
                        <button key={t} className={`${styles.chip} ${data.emlakTip === t ? styles.chipSel : ''}`}
                          onClick={() => set('emlakTip', t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Metrekare aralığı (m²)</label>
                    <div className={styles.rangeRow}>
                      <input className="form-input" placeholder="En az" value={data.m2Min}
                        onChange={e => set('m2Min', e.target.value)} />
                      <span className={styles.rangeSep}>—</span>
                      <input className="form-input" placeholder="En fazla" value={data.m2Max}
                        onChange={e => set('m2Max', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Oda sayısı</label>
                    <div className={styles.chipGroup}>
                      {odaSayilari.map(o => (
                        <button key={o} className={`${styles.chip} ${data.oda.includes(o) ? styles.chipSel : ''}`}
                          onClick={() => toggle('oda', o)}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Özellikler (birden fazla seçebilirsiniz)</label>
                    <div className={styles.chipGroup}>
                      {emlakTercihler.map(t => (
                        <button key={t} className={`${styles.chip} ${data.tercihler.includes(t) ? styles.chipSel : ''}`}
                          onClick={() => toggle('tercihler', t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                </>}

                {/* VASITA FIELDS */}
                {data.kategori === 'vasita' && <>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Marka tercihleri (birden fazla seçebilirsiniz)</label>
                    <div className={styles.chipGroup}>
                      {vasitaMarkalar.map(m => (
                        <button key={m} className={`${styles.chip} ${data.markalar.includes(m) ? styles.chipSel : ''}`}
                          onClick={() => toggle('markalar', m)}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Model yılı aralığı</label>
                    <div className={styles.rangeRow}>
                      <input className="form-input" placeholder="En eski (örn. 2018)" value={data.yilMin}
                        onChange={e => set('yilMin', e.target.value)} />
                      <span className={styles.rangeSep}>—</span>
                      <input className="form-input" placeholder="En yeni (örn. 2024)" value={data.yilMax}
                        onChange={e => set('yilMax', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">KM aralığı</label>
                    <div className={styles.rangeRow}>
                      <input className="form-input" placeholder="En az km" value={data.kmMin}
                        onChange={e => set('kmMin', e.target.value)} />
                      <span className={styles.rangeSep}>—</span>
                      <input className="form-input" placeholder="En fazla km" value={data.kmMax}
                        onChange={e => set('kmMax', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Yakıt tipi</label>
                    <div className={styles.chipGroup}>
                      {yakitTipleri.map(y => (
                        <button key={y} className={`${styles.chip} ${data.yakit.includes(y) ? styles.chipSel : ''}`}
                          onClick={() => toggle('yakit', y)}>{y}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className="form-label">Vites tipi</label>
                    <div className={styles.chipGroup}>
                      {vitesTipleri.map(v => (
                        <button key={v} className={`${styles.chip} ${data.vites.includes(v) ? styles.chipSel : ''}`}
                          onClick={() => toggle('vites', v)}>{v}</button>
                      ))}
                    </div>
                  </div>
                </>}

                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(2)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    onClick={() => setStep(4)}>Devam et →</button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Açıklama (isteğe bağlı)</label>
                  <textarea className="form-input" rows="5"
                    placeholder="Örn: Ocak ayına kadar taşınmam gerekiyor. Asansörlü tercih ederim. Hafta sonu görüşmeye uygunum."
                    style={{resize:'vertical', lineHeight:'1.6'}}
                    value={data.aciklama}
                    onChange={e => set('aciklama', e.target.value)} />
                  <p className={styles.hint}>Ne kadar detay verirseniz o kadar doğru eşleşirsiniz.</p>
                </div>
                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(3)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    onClick={() => setStep(5)}>Devam et →</button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div>
                <div className={styles.privacyBox}>
                  <div className={styles.privacyIcon}>🔒</div>
                  <div>
                    <strong>Bilgileriniz korunuyor</strong>
                    <p>Telefon numaranız satıcılara gizlidir. Yalnızca adınız ve soyad baş harfiniz ilanda görünür.</p>
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Adınız</label>
                  <input className="form-input" type="text" placeholder="Adınız (örn. Mehmet)"
                    value={data.ad} onChange={e => set('ad', e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className="form-label">Telefon numaranız</label>
                  <input className="form-input" type="tel" placeholder="0532 000 00 00"
                    value={data.telefon} onChange={e => set('telefon', e.target.value)} />
                  <p className={styles.hint}>Satıcılar bu numarayı göremez — sadece siz onay verince açılır.</p>
                </div>
                <div className={styles.footer}>
                  <button className="btn-ghost" onClick={() => setStep(4)}>← Geri</button>
                  <button className="btn-primary" style={{flex:1,justifyContent:'center'}}
                    disabled={!data.ad || !data.telefon}
                    onClick={handleSubmit}>
                    ✓ İlanı Yayınla
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
