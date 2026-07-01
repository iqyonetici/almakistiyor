// src/pages/nasil-calisir.js
import SeoMeta from '../components/SeoMeta'
import BilgiSayfasi, { h2Style, pStyle, kutuStyle } from '../components/BilgiSayfasi'

export default function NasilCalisir() {
  return (
    <>
      <SeoMeta
        title="Nasıl Çalışır?"
        description="AlmakIstiyor.com'da alıcı ilanı açın, satıcılar sizi bulsun. 3 adımda nasıl çalıştığını öğrenin."
        canonical="/nasil-calisir"
      />
      <BilgiSayfasi
      baslik="Nasıl çalışır?"
      aciklama="almakistiyor.com, alıcıların ne aradığını yazdığı, satıcıların da bu taleplere ulaştığı bir talep platformudur. Aramakla vakit kaybetmezsiniz; satıcılar size gelir."
    >
      <h2 style={h2Style}>Alıcıysanız (talep veren)</h2>
      <p style={pStyle}>
        Geleneksel ilan sitelerinde binlerce ilanı tek tek incelersiniz. Burada tam tersi olur:
        ne istediğinizi bir kez yazarsınız, uygun satıcılar size teklif gönderir.
      </p>
      <ol>
        <li style={{marginBottom:10}}><strong>Talep oluşturun.</strong> Ne aradığınızı, bütçenizi ve özelliklerinizi belirtin. (Örn. "İstanbul Kadıköy'de 2+1 kiralık daire arıyorum, en fazla 25.000 ₺.")</li>
        <li style={{marginBottom:10}}><strong>Satıcılar size ulaşsın.</strong> Talebinize uygun ürünü olan emlakçı, galerici veya satıcılar mesaj gönderir.</li>
        <li style={{marginBottom:10}}><strong>En iyi teklifi seçin.</strong> Gelen teklifleri karşılaştırır, dilediğinizle iletişime geçersiniz.</li>
      </ol>

      <div style={kutuStyle}>
        🔒 <strong>Numaranız gizli kalır.</strong> Telefon numaranız siz istemedikçe paylaşılmaz.
        İletişim önce platform üzerinden, mesajla başlar.
      </div>

      <h2 style={h2Style}>Satıcıysanız (emlakçı, galerici, mağaza)</h2>
      <p style={pStyle}>
        Müşteri aramak yerine, ne istediğini açıkça yazmış alıcılara ulaşırsınız. Talep ilanlarını
        kategoriye ve şehre göre inceler, elinizde uygun ürün varsa doğrudan teklif gönderirsiniz.
      </p>
      <ol>
        <li style={{marginBottom:10}}><strong>Talepleri inceleyin.</strong> İlgilendiğiniz kategorideki alıcı taleplerini görün.</li>
        <li style={{marginBottom:10}}><strong>Teklif gönderin.</strong> Uygun ürününüz varsa alıcıya mesajla ulaşın.</li>
        <li style={{marginBottom:10}}><strong>Anlaşın.</strong> Alıcı ilgilenirse iletişime geçer, satışı tamamlarsınız.</li>
      </ol>

      <h2 style={h2Style}>Neden almakistiyor.com?</h2>
      <ul>
        <li style={{marginBottom:8}}>📢 İlanı siz verirsiniz, satıcılar size gelir.</li>
        <li style={{marginBottom:8}}>🔍 Saatlerce ilan taramazsınız.</li>
        <li style={{marginBottom:8}}>💰 Satıcılar yarışır, en iyi fiyatı siz seçersiniz.</li>
        <li style={{marginBottom:8}}>📵 Numaranız gizli kalır, istenmeyen aramalar olmaz.</li>
      </ul>

      <div style={{...kutuStyle, background:'#FEF3DC', borderColor:'#F5CC80', textAlign:'center'}}>
        Hemen ücretsiz talep oluşturun — satıcılar sizi bulsun.
      </div>
    </BilgiSayfasi>
    </>
  )
}
