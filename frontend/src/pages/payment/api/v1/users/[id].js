import { useRouter } from 'next/router';
import React from 'react';

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>User Detail (Payment - API v1)</h1>
      <p>User ID: {id}</p>
    </div>
  );
}