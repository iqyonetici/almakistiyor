// src/pages/guvenlik.js
import BilgiSayfasi, { h2Style, pStyle, kutuStyle } from '../components/BilgiSayfasi'

export default function Guvenlik() {
  return (
    <BilgiSayfasi
      baslik="Güvenli alışveriş"
      aciklama="almakistiyor.com'da kendinizi ve cebinizi korumanın yolları. Birkaç basit kurala uyarak dolandırıcılıktan kaçınabilirsiniz."
    >
      <div style={{...kutuStyle, background:'#FEF2F2', borderColor:'#FECACA'}}>
        ⚠️ <strong>En önemli kural:</strong> Ürünü görmeden, teslim almadan kimseye
        <strong> ön ödeme, kapora veya kargo ücreti</strong> göndermeyin.
      </div>

      <h2 style={h2Style}>Alıcıysanız dikkat edin</h2>
      <ul>
        <li style={{marginBottom:8}}>Ürünü <strong>görmeden ödeme yapmayın.</strong> Mümkünse yüz yüze, ürünü inceleyerek alın.</li>
        <li style={{marginBottom:8}}>"Kapora gönder, ürünü ayırayım" diyen satıcılara <strong>şüpheyle yaklaşın.</strong></li>
        <li style={{marginBottom:8}}>Piyasanın çok altında fiyat <strong>genellikle tuzaktır.</strong> Çok ucuzsa, bir nedeni vardır.</li>
        <li style={{marginBottom:8}}>Ödemeyi mümkünse <strong>teslimat anında</strong> yapın. Kargoyla gelen ürünlerde kapıda ödeme tercih edin.</li>
        <li style={{marginBottom:8}}>Satıcının sizi platform dışına (WhatsApp, farklı site) <strong>aceleyle çekmesine</strong> dikkat edin.</li>
      </ul>

      <h2 style={h2Style}>Satıcıysanız dikkat edin</h2>
      <ul>
        <li style={{marginBottom:8}}>"Fazladan para gönderdim, farkı iade et" tarzı mesajlara <strong>kanmayın</strong> (klasik dolandırıcılık).</li>
        <li style={{marginBottom:8}}>Ödeme almadan ürünü <strong>kargoya vermeyin.</strong></li>
        <li style={{marginBottom:8}}>Sahte ödeme dekontlarına dikkat edin; <strong>hesabınıza geçtiğini kendiniz doğrulayın.</strong></li>
      </ul>

      <h2 style={h2Style}>Platformun sizi koruyan özellikleri</h2>
      <ul>
        <li style={{marginBottom:8}}>📵 <strong>Numara gizliliği:</strong> Telefon numaranız siz göstermedikçe paylaşılmaz.</li>
        <li style={{marginBottom:8}}>💬 <strong>Platform içi mesajlaşma:</strong> İletişim önce site üzerinden başlar, kişisel bilginizi paylaşmak zorunda kalmazsınız.</li>
        <li style={{marginBottom:8}}>🔒 <strong>SSL şifreleme:</strong> Site trafiğiniz şifrelenerek korunur.</li>
        <li style={{marginBottom:8}}>🚩 <strong>Bildirim sistemi:</strong> Şüpheli ilan ve kullanıcıları bize bildirebilirsiniz.</li>
      </ul>

      <div style={kutuStyle}>
        🚩 <strong>Şüpheli bir durumla mı karşılaştınız?</strong> Hemen{' '}
        <a href="/iletisim" style={{color:'#0D7A6B', fontWeight:600}}>iletişim sayfamızdan</a>{' '}
        bize bildirin. Bildirimleriniz öncelikli olarak incelenir.
      </div>
    </BilgiSayfasi>
  )
}
