// bosluk-kapat.mjs — ana sayfa hero alanindaki dikey bosluklari kisaltir.
// Calistir:  node bosluk-kapat.mjs   (proje kok klasoründen)
import fs from 'fs'

const cssYol = 'src/pages/index.module.css'
const jsYol = 'src/pages/index.js'

function oku(yol) {
  try { return fs.readFileSync(yol, 'utf8') }
  catch (e) { console.error('HATA: ' + yol + ' okunamadi. Proje kok klasoründe misin?'); process.exit(1) }
}

// — degisiklikler: [aciklama, regex, yeni metin] —
const cssDegisiklikler = [
  [
    'heroInner: dikey kolon + gap 20->8',
    /align-items: center;\s*\n\s*justify-content: space-between;\s*\n\s*gap: 20px;/,
    'flex-direction: column;\n  align-items: center;\n  gap: 8px;'
  ],
  [
    'hero ust/alt padding 14->8/10',
    /background: #085549;\s*\n\s*padding: 14px 16px;/,
    'background: #085549;\n  padding: 8px 16px 10px;'
  ],
  [
    'heroH1 alt margin 6->2',
    /margin-bottom: 6px; letter-spacing: -0\.3px;/,
    'margin-bottom: 2px; letter-spacing: -0.3px;'
  ],
  [
    'heroSub alt margin 14->6',
    /font-size: 13px; margin-bottom: 14px; line-height: 1\.5;/,
    'font-size: 13px; margin-bottom: 6px; line-height: 1.5;'
  ],
]

let css = oku(cssYol)
let cssHata = false
for (const [ad, re, yeni] of cssDegisiklikler) {
  const eslesme = css.match(new RegExp(re, 'g'))
  if (!eslesme) { console.error('HATA (CSS): "' + ad + '" bulunamadi.'); cssHata = true; continue }
  if (eslesme.length > 1) { console.error('HATA (CSS): "' + ad + '" birden fazla yerde (' + eslesme.length + ') bulundu, guvenlik icin atlandi.'); cssHata = true; continue }
  css = css.replace(re, () => yeni)
}

// — kutu ust margin: 18px -> 0 —
let js = oku(jsYol)
let jsHata = false
const kutuRe = /margin: '18px auto 0'/g
const kutuEslesme = js.match(kutuRe)
if (!kutuEslesme) { console.error('HATA (JS): kutu margin "18px auto 0" bulunamadi.'); jsHata = true }
else if (kutuEslesme.length > 1) { console.error('HATA (JS): kutu margin birden fazla bulundu, atlandi.'); jsHata = true }
else { js = js.replace(kutuRe, () => "margin: '0 auto'") }

if (cssHata || jsHata) {
  console.error('Bazi degisiklikler yapilamadi; HICBIR dosya kaydedilmedi.')
  process.exit(1)
}

fs.writeFileSync(cssYol, css, { encoding: 'utf8' })
fs.writeFileSync(jsYol, js, { encoding: 'utf8' })
console.log('OK: hero dikey bosluklari kisaldi (CSS + kutu).')
