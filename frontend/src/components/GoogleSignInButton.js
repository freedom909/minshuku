"use client";

import { useRouter } from "next/navigation";

export default function GoogleSignInButton() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      // ✅ 现在阶段：mock（你后端已支持）
      const idToken = "fake-token";

      const res = await fetch("http://localhost:4010/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          query: `
            mutation OAuthLogin($input: OAuthLoginInput!) {
              oauthLogin(input: $input) {
                accessToken
                user {
                  id
                  email
                  role
                }
              }
            }
          `,
          variables: {
            input: {
              provider: "GOOGLE",
              payload: {
                idToken,
              },
            },
          },
        }),
      });

      const json = await res.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      // ✅ 临时：存 accessToken
      localStorage.setItem(
        "accessToken",
        json.data.oauthLogin.accessToken
      );

      // ✅ 登录成功跳转
      router.push("/");
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Google login failed");
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full p-2 rounded bg-white text-black hover:bg-gray-100"
    >
      Continue with Google
    </button>
  );
}
