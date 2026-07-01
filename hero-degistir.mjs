// hero-degistir.mjs — almakistiyor ana sayfa hero kutusunu yeni tasarimla degistirir.
// Calistir:  node hero-degistir.mjs   (proje kok klasoründen)
import fs from 'fs'

const yol = 'src/pages/index.js'

let s
try {
  s = fs.readFileSync(yol, 'utf8')
} catch (e) {
  console.error('HATA: ' + yol + ' okunamadi. Proje kok klasoründe misin? (cd ile almakistiyor klasorune gel)')
  process.exit(1)
}

// Eski hero kutusu: <button className={styles.heroArama} ...> ... </button>
const eski = /<button className=\{styles\.heroArama\}[\s\S]*?<\/button>/

if (!eski.test(s)) {
  console.error('HATA: heroArama butonu bulunamadi. Dosya zaten degismis olabilir; hicbir sey yazilmadi.')
  process.exit(1)
}

const yeni = `<button onClick={formAc} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', maxWidth: 420, margin: '18px auto 0', background: '#fff', border: 'none', borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 13 }}>
              <img src="/almakistiyor-icon.png" alt="" width="30" height="30" style={{ borderRadius: 8, display: 'block' }} />
              <span style={{ fontSize: 16, color: '#1a1d23' }}><strong style={{ fontWeight: 600 }}>Almak</strong><span style={{ color: '#8a95a3' }}> istiyor</span></span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', background: '#F5A623', color: '#fff', borderRadius: 12, padding: 15, fontSize: 16, fontWeight: 600, boxSizing: 'border-box' }}>+ Ücretsiz Alım İlanı Ver</span>
            <span style={{ fontSize: 12, color: '#8a95a3', marginTop: 10 }}>60 saniyede yayında · ne arıyorsan satıcı sana gelsin</span>
          </button>`

s = s.replace(eski, () => yeni)
fs.writeFileSync(yol, s, { encoding: 'utf8' })
console.log('OK: hero kutusu yeni tasarimla degistirildi.')
