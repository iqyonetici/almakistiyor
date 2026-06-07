'use client';

import { useState, useCallback } from 'react';

export function useTelefonGoster(ilanId) {
  const [telefon, setTelefon] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [gosterildi, setGosterildi] = useState(false);

  const goster = useCallback(async () => {
    if (gosterildi && telefon) return;
    setYukleniyor(true);
    setHata(null);
    try {
      const res = await fetch('/api/telefon-goster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ilan_id: ilanId }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setHata({ tip: 'giris_gerekli', mesaj: 'Giris yapmalisiniz.' });
        return;
      }
      if (!data.basarili) {
        setHata({ tip: data.neden, mesaj: data.mesaj, limit: data.limit, kullanilan: data.kullanilan });
        return;
      }
      setTelefon(data.telefon);
      setGosterildi(true);
    } catch (err) {
      setHata({ tip: 'sunucu_hatasi', mesaj: 'Bir hata olustu, tekrar deneyin.' });
    } finally {
      setYukleniyor(false);
    }
  }, [ilanId, gosterildi, telefon]);

  return { telefon, yukleniyor, hata, goster, gosterildi };
}
