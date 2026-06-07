'use client';

import { useState } from 'react';
import { useTelefonGoster } from '@/hooks/useTelefonGoster';
import { useRouter } from 'next/navigation';

export default function TelefonGosterButonu({ ilanId, telefonOnizleme, className = '' }) {
  const { telefon, yukleniyor, hata, goster, gosterildi } = useTelefonGoster(ilanId);
  const [modalAcik, setModalAcik] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    await goster();
    if (!gosterildi) setModalAcik(true);
  };

  if (telefon) {
    return (
      <a
        href={`tel:${telefon.replace(/\s/g, '')}`}
        className={`inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors ${className}`}
      >
        <PhoneIcon />
        {telefon}
      </a>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={yukleniyor}
        className={`inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <PhoneIcon />
        <span>{yukleniyor ? 'Yukleniyor...' : (telefonOnizleme || 'Telefonu Gor')}</span>
        {!yukleniyor && (
          <span className="bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            Goster
          </span>
        )}
      </button>

      {modalAcik && hata && (
        <HataModal
          hata={hata}
          onKapat={() => setModalAcik(false)}
          onGirisYap={() => router.push('/giris')}
          onProYukselt={() => router.push('/pro')}
        />
      )}
    </>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
    </svg>
  );
}

function HataModal({ hata, onKapat, onGirisYap, onProYukselt }) {
  const icerik = {
    giris_gerekli: {
      baslik: 'Giris Yapin',
      aciklama: 'Telefon numaralarini gormek icin hesabiniza giris yapmaniz gerekiyor.',
      buton: { label: 'Giris Yap', action: onGirisYap, renk: 'bg-teal-600 hover:bg-teal-700' },
    },
    pro_gerekli: {
      baslik: 'Pro Uyelik Gerekli',
      aciklama: 'Telefon numaralarini gormek icin Pro uyelige sahip olmaniz gerekiyor.',
      buton: { label: "Pro'ya Yukselt", action: onProYukselt, renk: 'bg-orange-500 hover:bg-orange-600' },
    },
    limit_doldu: {
      baslik: 'Gunluk Limit Doldu',
      aciklama: `Bugun icin ${hata.limit} telefon goruntuleme hakkinizin tamamini kullandiniz. Yarin yenilenir.`,
      buton: { label: 'Plani Yukselt', action: onProYukselt, renk: 'bg-orange-500 hover:bg-orange-600' },
    },
  }[hata.tip] || {
    baslik: 'Bir Hata Olustu',
    aciklama: hata.mesaj || 'Beklenmeyen bir hata olustu.',
    buton: null,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onKapat}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">{icerik.baslik}</h3>
        <p className="text-gray-600 text-sm mb-5">{icerik.aciklama}</p>

        {hata.tip === 'limit_doldu' && (
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Kullanilan</span>
              <span className="font-semibold">{hata.kullanilan} / {hata.limit}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full w-full" />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onKapat}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Kapat
          </button>
          {icerik.buton && (
            <button
              onClick={icerik.buton.action}
              className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors text-sm font-medium ${icerik.buton.renk}`}
            >
              {icerik.buton.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
