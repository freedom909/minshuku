// frontend/src/app/login/page.tsx
'use client';

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <button onClick={() => signIn("google")}>Continue with Google</button>
      <button onClick={() => signIn("facebook")}>Continue with Facebook</button>
      {/* Add credentials form if needed */}
    </div>
  );
}
