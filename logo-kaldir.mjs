// logo-kaldir.mjs — hero kutusundaki logo + "Almak istiyor" satirini kaldirir,
// turuncu butonu yukari ceker. Calistir:  node logo-kaldir.mjs  (proje kok klasoründen)
import fs from 'fs'

const yol = 'src/pages/index.js'

let s
try { s = fs.readFileSync(yol, 'utf8') }
catch (e) { console.error('HATA: ' + yol + ' okunamadi. Proje kok klasoründe misin?'); process.exit(1) }

// Logo satiri: marginBottom: 13 olan span (img + "Almak istiyor") — kapanisina kadar
const re = /\s*<span style=\{\{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 13 \}\}>[\s\S]*?> istiyor<\/span><\/span>\s*<\/span>/

const eslesme = s.match(new RegExp(re, 'g'))
if (!eslesme) { console.error('HATA: logo satiri bulunamadi. Dosya zaten degismis olabilir; hicbir sey yazilmadi.'); process.exit(1) }
if (eslesme.length > 1) { console.error('HATA: logo satiri birden fazla bulundu, guvenlik icin atlandi.'); process.exit(1) }

s = s.replace(re, '')
fs.writeFileSync(yol, s, { encoding: 'utf8' })
console.log('OK: logo + Almak istiyor satiri kaldirildi, buton yukari cekildi.')
