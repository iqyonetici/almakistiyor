import { useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import IlanForm from '../components/IlanForm'
import styles from './pro.module.css'

const paketler = [
  {
    id: 'starter', ad: 'Starter', fiyat: 499, renk: 'white',
    ozellikler: [
      { label: '10 iletişim bilgisi/ay', aktif: true },
      { label: 'Telefon + e-posta görme', aktif: true },
      { label: 'Günlük e-posta bildirimi', aktif: true },
      { label: 'Anlık SMS bildirimi', aktif: false },
      { label: 'Öne çıkan profil', aktif: false },
      { label: 'API erişimi', aktif: false },
    ]
  },
  {
    id: 'pro', ad: 'Pro', fiyat: 1299, renk: 'teal', popular: true,
    ozellikler: [
      { label: 'Sınırsız iletişim bilgisi', aktif: true },
      { label: 'Telefon + e-posta görme', aktif: true },
      { label: 'Anlık SMS bildirimi', aktif: true },
      { label: 'Öne çıkan profil sayfası', aktif: true },
      { label: 'Öncelik sıralaması', aktif: true },
      { label: 'API erişimi', aktif: false },
    ]
  },
  {
    id: 'kurumsal', ad: 'Kurumsal', fiyat: 3499, renk: 'dark',
    ozellikler: [
      { label: 'Sınırsız iletişim bilgisi', aktif: true },
      { label: 'Telefon + e-posta görme', aktif: true },
      { label: 'Anlık SMS bildirimi', aktif: true },
      { label: 'Marka profil sayfası', aktif: true },
      { label: 'Öncelik sıralaması', aktif: true },
      { label: 'API erişimi', aktif: true },
    ]
  },
]

export default function Pro() {
  const [formOpen, setFormOpen] = useState(false)
  const [secili, setSecili] = useState('pro')

  return (
    <>
      <Head><title>Profesyonel Erişim — AlmakIstiyor.com</title></Head>
      <Navbar onIlanVer={() => setFormOpen(true)} />

      <div className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroBadge}>🏢 Emlakçı & Galericiler İçin</div>
          <h1>Alıcı taleplerine <em>doğrudan erişin</em></h1>
          <p>14.000'den fazla aktif alıcı talebi. İletişim bilgisine ulaşmak için paket seçin.</p>
          <div className={styles.heroStats}>
            {[['14.320+','Aktif talep'],['3.800+','Kayıtlı satıcı'],['%94','Eşleşme oranı'],['3','Ücretsiz hak']].map(([n,l])=>(
              <div key={l} className={styles.stat}><div className={styles.statN}>{n}</div><div className={styles.statL}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className={`container ${styles.content}`}>

        {/* NASIL ÇALIŞIR */}
        <div className={styles.nasil}>
          <h2 className={styles.sectionTitle}>Nasıl çalışır?</h2>
          <div className={styles.nasilGrid}>
            {[
              { n:'1', icon:'📝', baslik:'Kayıt olun', acik:'Ücretsiz hesap oluşturun. 3 iletişim bilgisini ücretsiz görün.' },
              { n:'2', icon:'🔍', baslik:'Talepleri filtreleyin', acik:'Şehir, kategori, bütçe aralığına göre alıcı taleplerini listeleyin.' },
              { n:'3', icon:'💬', baslik:'Mesaj gönderin', acik:'Her alıcıya ücretsiz 1 mesaj hakkınız var. Telefon için paket alın.' },
              { n:'4', icon:'🤝', baslik:'İşi kapatın', acik:'Alıcıyla doğrudan iletişime geçin, anlaşmayı yapın.' },
            ].map(s => (
              <div key={s.n} className={styles.nasilKart}>
                <div className={styles.nasilNo}>{s.n}</div>
                <div className={styles.nasilIcon}>{s.icon}</div>
                <h3>{s.baslik}</h3>
                <p>{s.acik}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ÜCRETSİZ MESAJ UYARISI */}
        <div className={styles.uyariBox}>
          <span style={{fontSize:20}}>💡</span>
          <div>
            <strong>Ücretsiz mesaj hakkı:</strong> Kayıt olan her satıcı, her alıcıya <strong>1 ücretsiz mesaj</strong> gönderebilir.
            Alıcının telefon numarasını görmek ve daha fazla mesaj göndermek için paket satın almanız gerekir.
            Alıcı <strong>3 mesaj veya 3 telefon görüşmesi</strong> hakkı tanır — bu hakkı kullanmak için paket gereklidir.
          </div>
        </div>

        {/* PAKETLER */}
        <h2 className={styles.sectionTitle} style={{textAlign:'center',marginBottom:32}}>Paket seçin</h2>
        <div className={styles.paketGrid}>
          {paketler.map(p => (
            <div key={p.id}
              className={`${styles.paket} ${p.renk === 'teal' ? styles.paketTeal : p.renk === 'dark' ? styles.paketDark : styles.paketWhite} ${secili === p.id ? styles.paketSec : ''}`}
              onClick={() => setSecili(p.id)}>
              {p.popular && <div className={styles.popularBadge}>En Popüler</div>}
              <div className={styles.paketAd}>{p.ad}</div>
              <div className={styles.paketFiyat}>₺{p.fiyat.toLocaleString('tr-TR')}<span>/ay</span></div>
              <ul className={styles.paketList}>
                {p.ozellikler.map((o,i) => (
                  <li key={i} className={!o.aktif ? styles.pasifOzellik : ''}>
                    <span className={styles.ozellikIcon}>{o.aktif ? '✓' : '✗'}</span>
                    {o.label}
                  </li>
                ))}
              </ul>
              <a href="/kayit" className={`${styles.paketBtn} ${p.renk !== 'white' ? styles.paketBtnLight : styles.paketBtnDark}`}>
                Başla →
              </a>
            </div>
          ))}
        </div>

        <p className={styles.ücretszNot}>
          * Tüm paketler aylık olup istediğiniz zaman iptal edilebilir. İlk 3 görüntüleme tamamen ücretsizdir.
        </p>

        {/* SSS */}
        <div className={styles.sss}>
          <h2 className={styles.sectionTitle}>Sık sorulan sorular</h2>
          <div className={styles.sssListesi}>
            {[
              { s:'Ücretsiz mesaj hakkı nasıl çalışır?', c:'Her alıcıya platforma üye olduğunuzda 1 ücretsiz mesaj gönderme hakkınız vardır. Alıcı bunu seçmişse size yanıt verebilir.' },
              { s:'Telefon numarasını ne zaman görebilirim?', c:'Starter ve üzeri paket satın aldıktan sonra alıcının telefon numarasına erişebilirsiniz. Alıcının iletişim tercihi "telefon" veya "ikisi" olmalıdır.' },
              { s:'3 mesaj / 3 telefon hakkı ne anlama geliyor?', c:'Alıcı ilanı verirken satıcılara kaç kişinin kendisine ulaşabileceğini belirleyebilir. Bu hakkı aşamazsınız.' },
              { s:'Paketimi istediğim zaman iptal edebilir miyim?', c:'Evet, tüm paketler aylık döngüseldir. Bir sonraki ödeme tarihinden önce iptal ederseniz ücret alınmaz.' },
            ].map((f,i) => (
              <div key={i} className={styles.sssItem}>
                <div className={styles.sssSoru}>❓ {f.s}</div>
                <div className={styles.sssCevap}>{f.c}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
      <IlanForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
