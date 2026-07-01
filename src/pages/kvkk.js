// src/pages/kvkk.js
import BilgiSayfasi, { h2Style, pStyle, kutuStyle } from '../components/BilgiSayfasi'

export default function KVKK() {
  return (
    <BilgiSayfasi
      baslik="KVKK Aydınlatma Metni"
      aciklama="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin bilgilendirme."
    >
      <p style={pStyle}>
        almakistiyor.com ("Platform") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu
        ("KVKK") uyarınca veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan
        kapsamda işlemekteyiz.
      </p>

      <h2 style={h2Style}>1. İşlenen kişisel veriler</h2>
      <ul>
        <li style={{marginBottom:8}}><strong>Kimlik ve iletişim:</strong> Ad-soyad, e-posta, telefon numarası.</li>
        <li style={{marginBottom:8}}><strong>İşlem bilgileri:</strong> Oluşturduğunuz talep ilanları, gönderdiğiniz mesajlar.</li>
        <li style={{marginBottom:8}}><strong>Konum bilgisi:</strong> İlanlarınızda belirttiğiniz il/ilçe bilgisi.</li>
        <li style={{marginBottom:8}}><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, çerez kayıtları.</li>
      </ul>

      <h2 style={h2Style}>2. İşleme amaçları</h2>
      <ul>
        <li style={{marginBottom:8}}>Platform hizmetlerinin sunulması (talep ilanı oluşturma, mesajlaşma).</li>
        <li style={{marginBottom:8}}>Alıcı ve satıcıların eşleştirilmesi.</li>
        <li style={{marginBottom:8}}>Güvenliğin sağlanması, dolandırıcılığın önlenmesi.</li>
        <li style={{marginBottom:8}}>Yasal yükümlülüklerin yerine getirilmesi.</li>
      </ul>

      <h2 style={h2Style}>3. Hukuki sebep</h2>
      <p style={pStyle}>
        Kişisel verileriniz, KVKK md. 5 uyarınca sözleşmenin kurulması/ifası, hukuki yükümlülüğün
        yerine getirilmesi, meşru menfaat ve açık rızanız hukuki sebeplerine dayanılarak işlenir.
      </p>

      <h2 style={h2Style}>4. Verilerin aktarımı</h2>
      <p style={pStyle}>
        Verileriniz; hizmetin gerektirdiği ölçüde altyapı sağlayıcılarımıza (sunucu, e-posta),
        yasal merciler talep ettiğinde yetkili kamu kurumlarına aktarılabilir. İlan oluşturduğunuzda
        ilanınızdaki bilgiler diğer kullanıcılarca görülebilir hale gelir.
      </p>

      <h2 style={h2Style}>5. Haklarınız (KVKK md. 11)</h2>
      <p style={pStyle}>Kanun kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme,
        düzeltilmesini/silinmesini isteme, işlemenin sınırlandırılmasını talep etme haklarına sahipsiniz.</p>

      <div style={kutuStyle}>
        Taleplerinizi{' '}
        <a href="/iletisim" style={{color:'#0D7A6B', fontWeight:600}}>iletişim formumuz</a>{' '}
        üzerinden (konu türü: "İstek") veya{' '}
        <a href="mailto:iqyonetici@gmail.com" style={{color:'#0D7A6B', fontWeight:600}}>iqyonetici@gmail.com</a>{' '}
        adresine iletebilirsiniz.
      </div>
    </BilgiSayfasi>
  )
}
