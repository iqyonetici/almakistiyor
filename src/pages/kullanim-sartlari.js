// src/pages/kullanim-sartlari.js
import BilgiSayfasi, { h2Style, pStyle, kutuStyle } from '../components/BilgiSayfasi'

export default function KullanimSartlari() {
  return (
    <BilgiSayfasi
      baslik="Kullanım Şartları"
      aciklama="almakistiyor.com'u kullanırken uymanız gereken kurallar ve tarafların hak ve yükümlülükleri."
    >
      <p style={pStyle}>
        almakistiyor.com'u ("Platform") kullanarak aşağıdaki şartları kabul etmiş olursunuz.
        Şartları kabul etmiyorsanız platformu kullanmamanızı rica ederiz.
      </p>

      <h2 style={h2Style}>1. Platformun işleyişi</h2>
      <p style={pStyle}>
        Platform, alıcıların talep ilanı oluşturduğu ve satıcıların bu taleplere ulaştığı bir
        aracı hizmettir. Platform, alıcı ve satıcı arasındaki alım-satım işleminin <strong>tarafı
        değildir</strong>; ürün/hizmetin kalitesinden, teslimatından veya ödemesinden sorumlu tutulamaz.
      </p>

      <h2 style={h2Style}>2. Kullanıcı yükümlülükleri</h2>
      <ul>
        <li style={{marginBottom:8}}>Doğru, güncel ve yanıltıcı olmayan bilgiler paylaşmak.</li>
        <li style={{marginBottom:8}}>Yasalara aykırı ürün/hizmet talep etmemek veya sunmamak.</li>
        <li style={{marginBottom:8}}>Başkalarının haklarını ihlal eden, hakaret/spam içeren içerik paylaşmamak.</li>
        <li style={{marginBottom:8}}>Hesabın güvenliğinden kendisi sorumlu olmak.</li>
      </ul>

      <h2 style={h2Style}>3. Yasaklı içerikler</h2>
      <p style={pStyle}>Aşağıdaki içerikler kesinlikle yasaktır:</p>
      <ul>
        <li style={{marginBottom:8}}>Yasa dışı, çalıntı veya sahte ürünler.</li>
        <li style={{marginBottom:8}}>Silah, uyuşturucu, reçeteli ilaç gibi düzenlemeye tabi ürünler.</li>
        <li style={{marginBottom:8}}>Yanıltıcı, dolandırıcılık amaçlı ilanlar.</li>
        <li style={{marginBottom:8}}>Yürürlükteki mevzuata aykırı canlı hayvan satışı.</li>
      </ul>

      <h2 style={h2Style}>4. Sorumluluğun sınırlandırılması</h2>
      <p style={pStyle}>
        Platform, kullanıcılar arasındaki iletişim ve işlemlerden doğan zararlardan sorumlu değildir.
        Kullanıcılar, alışveriş öncesi gerekli özeni göstermekle yükümlüdür. Dolandırıcılık riskine
        karşı{' '}
        <a href="/guvenlik" style={{color:'#0D7A6B', fontWeight:600}}>Güvenli alışveriş</a>{' '}
        rehberini okumanızı öneririz.
      </p>

      <h2 style={h2Style}>5. İçeriğin kaldırılması</h2>
      <p style={pStyle}>
        Platform, kurallara aykırı bulduğu ilanları ve hesapları önceden bildirimde bulunmaksızın
        kaldırma/askıya alma hakkını saklı tutar.
      </p>

      <h2 style={h2Style}>6. Değişiklikler</h2>
      <p style={pStyle}>
        Bu şartlar zaman zaman güncellenebilir. Güncel sürüm bu sayfada yayınlanır; platformu
        kullanmaya devam etmeniz güncel şartları kabul ettiğiniz anlamına gelir.
      </p>

      <div style={kutuStyle}>
        Sorularınız için{' '}
        <a href="/iletisim" style={{color:'#0D7A6B', fontWeight:600}}>iletişim sayfamızdan</a>{' '}
        bize ulaşabilirsiniz.
      </div>
    </BilgiSayfasi>
  )
}
