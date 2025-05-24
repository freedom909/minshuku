"use client";
//src/pages/login.js

import { useRouter } from "next/navigation";
import localAuthService from "@/userService/localAuthService";
import { signIn } from "next-auth/react"; // 🔹 NextAuth.js for OAuth
import Head from "next/head";
import { useState, useEffect } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
      google.accounts.id.prompt();
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    const token = response.credential;
    // same logic from /auth to use oauthService or fallback
  };
  //🔹 Handle traditional login/signup
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await localAuthService.register(email, password);
        alert("Sign up successful!");
      } else {
        await localAuthService.login(email, password);
        alert("Login successful!");
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = "/dashboard"; // or any protected page
    } else {
      alert("Login failed");
    }
  };

  // 🔹 Handle SSO Login
  const handleSSOLogin = async (provider) => {
    try {
      const result = await signIn(provider, { callbackUrl: "/dashboard" });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("SSO Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        {isSignUp ? "Sign Up" : "Login"}
      </h1>
      <Head>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </Head>
      <div id="googleSignInDiv" className="mb-2"></div>

      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-64">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className={`p-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-blue-500"
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      {/* 🔹 SSO Login Buttons */}
      <div className="mt-4">
        <GoogleSignInButton useGIS={false} />
        <button
          onClick={() => handleSSOLogin("github")}
          className="p-2 bg-gray-800 text-white rounded w-full"
        >
          GitHub Sign in
        </button>
        <button
          onClick={() => handleSSOLogin("facebook")}
          className="p-2 bg-gray-800 text-white rounded w-full"
        >
          facebook Sign in
        </button>
      </div>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-blue-500 underline"
      >
        {isSignUp
          ? "Already have an account? Log in"
          : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}
