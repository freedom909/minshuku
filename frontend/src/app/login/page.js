"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import localAuthService from "../userService/localAuthService";
import { signIn } from "next-auth/react"; // 🔹 NextAuth.js for OAuth

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    // 🔹 Handle traditional login/signup
    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     setLoading(true);
    //     setError(null);

    //     try {
    //         if (isSignUp) {
    //             await localAuthService.register(email, password);
    //             alert("Sign up successful!");
    //         } else {
    //             await localAuthService.login(email, password);
    //             alert("Login successful!");
    //             router.push("/dashboard");
    //         }
    //     } catch (err) {
    //         setError(err.message || "An error occurred. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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
            const result = await signIn(provider, { callbackUrl: '/dashboard' });// is signIn a server side component?
            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            setError("SSO Login failed. Please try again.");
        }
    };

    const handleGoogleOAuthLogin = async (googleResponse) => {
        const googleToken = googleResponse.credential;
      
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: googleToken, provider: "google" }),
        });
      
        const result = await response.json();
      
        if (result.success) {
          window.location.href = "/dashboard";
        } else {
          alert("OAuth login failed");
        }
      };
      

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">{isSignUp ? "Sign Up" : "Login"}</h1>
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
                    className={`p-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-500"}`}
                    disabled={loading}
                >
                    {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
                </button>
            </form>

            {/* 🔹 SSO Login Buttons */}
            <div className="mt-4">
                <button
                    onClick={() => handleSSOLogin("google")}
                    className="p-2 bg-red-500 text-white rounded w-full mb-2"
                >
                    Sign in with Google
                </button>
                <button
                    onClick={() => handleSSOLogin("github")}
                    className="p-2 bg-gray-800 text-white rounded w-full"
                >
                    Sign in with GitHub
                </button>
                <button
                    onClick={() => handleSSOLogin("facebook")}
                    className="p-2 bg-gray-800 text-white rounded w-full"
                >
                    Sign in with facebook
                </button>
            </div>

            <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="mt-4 text-blue-500 underline"
            >
                {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
        </div>
    );
}