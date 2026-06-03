import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function KategoriRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      router.replace('/?kategori=' + (router.query.slug || ''));
    }
  }, [router.isReady, router.query.slug]);
  return null;
}