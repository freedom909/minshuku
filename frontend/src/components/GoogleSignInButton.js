"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import OAuthService from "@/userService/oauthService";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ useGIS = true }) {
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState(null);
    const [loadedGIS, setLoadedGIS] = useState(false);

    useEffect(() => {
        setIsClient(true);

        if (useGIS && typeof window !== "undefined" && window.google && googleClientId) {
            try {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleCredentialResponse,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInDiv"),
                    { theme: "outline", size: "large" }
                );

                setLoadedGIS(true);
            } catch (e) {
                console.warn("Failed to initialize GIS, falling back to NextAuth");
            }
        }
    }, [useGIS]);

    const handleCredentialResponse = async (response) => {
        const token = response.credential;
        try {
            const oauthService = new OAuthService();
            const result = await oauthService.loginWithProvider("google", token);

            if (result.success) {
                localStorage.setItem("username", result.user.name);
                window.location.href = "/dashboard";
            } else {
                fallbackSignIn();
            }
        } catch (err) {
            console.error("GIS login failed:", err);
            fallbackSignIn();
        }
    };

    const fallbackSignIn = async () => {
        try {
            const res = await signIn("google", { callbackUrl: "/dashboard" });
            if (!res?.ok) setError("Fallback Google login failed.");
        } catch (err) {
            console.error("Fallback signIn error:", err);
            setError("Unexpected error during fallback login.");
        }
    };

    if (!isClient) return null;

    return (
        <div className="flex flex-col items-center">
            {useGIS && (
                <div id="googleSignInDiv" className="mb-2"></div>
            )}

            {!useGIS || !loadedGIS ? (
                <button
                    onClick={fallbackSignIn}
                    className="bg-red-500 text-white px-4 py-2 rounded w-full"
                >
                    Sign in with Google
                </button>
            ) : null}

            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}