// src/pages/iletisim.js
import BilgiSayfasi, { h2Style, pStyle, kutuStyle } from '../components/BilgiSayfasi'
import Link from 'next/link'

export default function Iletisim() {
  return (
    <BilgiSayfasi
      baslik="İletişim"
      aciklama="almakistiyor.com işletme bilgileri ve iletişim kanalları."
    >
      <p style={pStyle}>
        almakistiyor.com, aşağıda bilgileri yer alan işletme tarafından işletilmektedir.
      </p>

      <h2 style={h2Style}>İşletme Bilgileri</h2>
      <p style={pStyle}>
        <strong>Ticaret Unvanı:</strong> Caner Demiral<br />
        <strong>İş Yeri Adresi:</strong> Başakşehir Mah. Anafartalar Cad. Oyakkent 1 Sitesi Blok A13 No: 2 İç Kapı No: 41 Başakşehir / İstanbul<br />
        <strong>Vergi Dairesi:</strong> İkitelli<br />
        <strong>Vergi Kimlik No:</strong> 2790165007
      </p>

      <h2 style={h2Style}>İletişim</h2>
      <p style={pStyle}>
        <strong>E-posta:</strong> iqyonetici@gmail.com
      </p>

      <div style={kutuStyle}>
        Destek talebi, şikayet, öneri veya teknik sorunlarınız için{' '}
        <Link href="/yardim">Yardım &amp; Destek</Link> sayfamızdaki formu kullanmanızı öneririz —
        talepleriniz oradan takip edilir ve daha hızlı yanıtlanır.
      </div>
    </BilgiSayfasi>
  )
}
