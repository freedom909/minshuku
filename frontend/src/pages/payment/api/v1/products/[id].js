import { useRouter } from 'next/router';
import React from 'react';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Product Detail (Payment - API v1)</h1>
      <p>Product ID: {id}</p>
    </div>
  );
}