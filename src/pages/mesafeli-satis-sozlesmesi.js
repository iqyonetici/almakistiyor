// src/pages/mesafeli-satis-sozlesmesi.js
import BilgiSayfasi, { h2Style, pStyle, liStyle, kutuStyle } from '../components/BilgiSayfasi'

export default function MesafeliSatisSozlesmesi() {
  return (
    <BilgiSayfasi
      baslik="Mesafeli Satış Sözleşmesi"
      aciklama="Pro üyelik satın alımlarına ilişkin mesafeli satış sözleşmesi."
    >
      <h2 style={h2Style}>1. Taraflar</h2>
      <p style={pStyle}>
        İşbu sözleşme; bir tarafta <strong>Caner Demiral</strong> (Vergi Dairesi: İkitelli,
        Vergi Kimlik No: 2790165007, Adres: Başakşehir Mah. Anafartalar Cad. Oyakkent 1
        Sitesi Blok A13 No: 2 İç Kapı No: 41 Başakşehir / İstanbul) ("SATICI") ile diğer
        tarafta almakistiyor.com üzerinden Pro üyelik satın alan kullanıcı ("ALICI")
        arasında elektronik ortamda kurulmuştur.
      </p>

      <h2 style={h2Style}>2. Sözleşmenin Konusu</h2>
      <p style={pStyle}>
        Sözleşmenin konusu, ALICI'nın almakistiyor.com üzerinden elektronik ortamda
        siparişini verdiği, niteliği ve satış bedeli aşağıda belirtilen dijital hizmetin
        ("Pro Üyelik") satışı ve ifasına ilişkin olarak 6502 sayılı Tüketicinin
        Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri
        gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
      </p>

      <h2 style={h2Style}>3. Hizmetin Niteliği</h2>
      <p style={pStyle}>
        Pro Üyelik, almakistiyor.com platformunda satıcı hesaplarına tanınan; günlük
        ilan/mesaj limitlerinin artırılması, telefon numarası görüntüleme, öncelikli
        sıralama, onaylı rozet gibi ek özellikleri kapsayan, fiziksel teslimatı
        bulunmayan dijital bir abonelik hizmetidir. Güncel paket içerikleri ve
        fiyatları <strong>almakistiyor.com/pro</strong> sayfasında ilan edilir.
      </p>

      <h2 style={h2Style}>4. Ödeme Şekli</h2>
      <p style={pStyle}>
        Ödemeler, SATICI'nın anlaşmalı olduğu ödeme kuruluşu üzerinden kredi kartı /
        banka kartı ile, siparişin onaylanmasıyla eş zamanlı olarak tek seferde veya
        seçilen döneme (aylık/yıllık) göre tahsil edilir.
      </p>

      <h2 style={h2Style}>5. Hizmetin İfası</h2>
      <p style={pStyle}>
        Ödemenin onaylanmasının ardından Pro Üyelik özellikleri ALICI'nın hesabına
        anında tanımlanır. Hizmetin ifası, ödemenin başarıyla tamamlanmasıyla başlamış
        sayılır.
      </p>

      <h2 style={h2Style}>6. Cayma Hakkı</h2>
      <div style={kutuStyle}>
        Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, elektronik ortamda
        anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi
        mallara ilişkin sözleşmelerde cayma hakkı bulunmamaktadır. ALICI, Pro Üyelik
        satın alma işlemini onaylayarak hizmetin ifasının derhal başlamasını talep
        etmiş ve bu doğrultuda cayma hakkının kullanılamayacağını kabul etmiş sayılır.
      </div>

      <h2 style={h2Style}>7. Fesih / İptal</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li style={liStyle}>ALICI, dilediği zaman ek ücret ödemeksizin Pro Üyeliğini iptal edebilir.</li>
        <li style={liStyle}>İptal, mevcut ödeme döneminin sonunda geçerli olur; kalan süre için kısmi iade yapılmaz.</li>
        <li style={liStyle}>SATICI, kullanım şartlarına aykırı davranış tespit ettiği hesapların Pro Üyeliğini askıya alma/iptal etme hakkını saklı tutar.</li>
      </ul>

      <h2 style={h2Style}>8. Uyuşmazlıkların Çözümü</h2>
      <p style={pStyle}>
        İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca ilan edilen
        parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki Tüketici Hakem
        Heyetleri ve Tüketici Mahkemeleri yetkilidir.
      </p>

      <h2 style={h2Style}>9. Yürürlük</h2>
      <p style={pStyle}>
        ALICI, Pro Üyelik satın alma işlemini tamamlayarak işbu sözleşmenin tüm
        maddelerini okuduğunu ve kabul ettiğini beyan eder.
      </p>
    </BilgiSayfasi>
  )
}
