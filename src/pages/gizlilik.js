// src/pages/gizlilik.js
import BilgiSayfasi, { h2Style, pStyle, kutuStyle } from '../components/BilgiSayfasi'

export default function Gizlilik() {
  return (
    <BilgiSayfasi
      baslik="Gizlilik Politikası"
      aciklama="Kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgilendirme."
    >
      <p style={pStyle}>
        Bu Gizlilik Politikası, almakistiyor.com'u kullanırken verilerinizin nasıl işlendiğini açıklar.
        Platformu kullanarak bu politikayı kabul etmiş sayılırsınız.
      </p>

      <h2 style={h2Style}>Hangi bilgileri topluyoruz?</h2>
      <ul>
        <li style={{marginBottom:8}}><strong>Verdiğiniz bilgiler:</strong> Hesap oluştururken ve ilan verirken girdiğiniz ad, e-posta, telefon, konum ve ilan içerikleri.</li>
        <li style={{marginBottom:8}}><strong>Otomatik toplanan:</strong> IP adresi, cihaz/tarayıcı bilgisi, site kullanım istatistikleri ve çerezler.</li>
      </ul>

      <h2 style={h2Style}>Bilgilerinizi nasıl kullanıyoruz?</h2>
      <ul>
        <li style={{marginBottom:8}}>Talep ilanlarınızı yayınlamak ve satıcılarla eşleştirmek.</li>
        <li style={{marginBottom:8}}>Mesajlaşma ve bildirim hizmetlerini sağlamak.</li>
        <li style={{marginBottom:8}}>Güvenliği sağlamak, kötüye kullanımı önlemek.</li>
        <li style={{marginBottom:8}}>Hizmet kalitesini geliştirmek.</li>
      </ul>

      <h2 style={h2Style}>Telefon numarası gizliliği</h2>
      <div style={kutuStyle}>
        📵 Telefon numaranız, <strong>siz "Telefonu Göster" ile paylaşmayı seçmediğiniz sürece</strong>
        diğer kullanıcılara gösterilmez. İletişim öncelikle platform içi mesajlaşma ile yürür.
      </div>

      <h2 style={h2Style}>Çerezler</h2>
      <p style={pStyle}>
        Platform; oturumunuzu sürdürmek ve kullanım deneyimini iyileştirmek için zorunlu çerezler
        kullanır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz; ancak bazı çerezleri
        engellemek platformun çalışmasını etkileyebilir.
      </p>

      <h2 style={h2Style}>Bilgilerinizin paylaşımı</h2>
      <p style={pStyle}>
        Verilerinizi pazarlama amacıyla üçüncü taraflara <strong>satmıyoruz.</strong> Yalnızca
        hizmetin işleyişi için gerekli altyapı sağlayıcılarla ve yasal zorunluluk halinde yetkili
        mercilerle paylaşırız.
      </p>

      <h2 style={h2Style}>Veri güvenliği</h2>
      <p style={pStyle}>
        Verileriniz SSL şifrelemesi ve erişim kontrolleriyle korunur. Yine de internet üzerinden
        hiçbir aktarımın %100 güvenli olmadığını hatırlatırız.
      </p>

      <h2 style={h2Style}>Haklarınız</h2>
      <p style={pStyle}>
        Verilerinize erişme, düzeltme veya silinmesini talep etme hakkınız vardır. Detaylar için{' '}
        <a href="/kvkk" style={{color:'#0D7A6B', fontWeight:600}}>KVKK Aydınlatma Metni</a>'ni inceleyebilir,
        taleplerinizi{' '}
        <a href="/iletisim" style={{color:'#0D7A6B', fontWeight:600}}>iletişim formumuz</a>{' '}
        üzerinden iletebilirsiniz.
      </p>
    </BilgiSayfasi>
  )
}
