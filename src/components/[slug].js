import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function KategoriRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (router.query.slug) {
      router.replace('/?kategori=' + router.query.slug);
    }
  }, [router.query.slug]);
  return null;
}