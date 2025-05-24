"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import oauthService from "@/userService/oauthService";

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

export default function FacebookSignInButton() {
    const [error, setError] = useState(null);
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);

    useEffect(() => {
        // 加载 Facebook SDK
        if (!window.FB) {
            window.fbAsyncInit = function() {
                window.FB.init({
                    appId: facebookAppId,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                setIsSDKLoaded(true);
            };

            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        } else {
            setIsSDKLoaded(true);
        }
    }, []);

    const handleFacebookLogin = async () => {
        if (!window.FB) {
            setError("Facebook SDK not loaded");
            return;
        }

        try {
            const fbResponse = await new Promise((resolve, reject) => {
                window.FB.login((response) => {
                    if (response.authResponse) {
                        resolve(response.authResponse);
                    } else {
                        reject(new Error('User cancelled login or did not fully authorize.'));
                    }
                }, { scope: 'public_profile,email' });
            });

            const { accessToken } = fbResponse;

            try {
                const result = await oauthService.loginWithProvider("facebook", accessToken);

                if (result.success) {
                    localStorage.setItem("username", result.user.name);
                    window.location.href = "/dashboard";
                } else {
                    fallbackSignIn();
                }
            } catch (err) {
                console.error("Facebook login failed:", err);
                fallbackSignIn();
            }
        } catch (err) {
            console.error("Facebook SDK login error:", err);
            fallbackSignIn();
        }
    };

    const fallbackSignIn = async () => {
        try {
            const result = await signIn("facebook", {
                callbackUrl: "/dashboard",
                redirect: false
            });

            if (result?.error) {
                setError("Facebook login failed.");
                console.error("Facebook login error:", result.error);
            }
        } catch (err) {
            console.error("Facebook signIn error:", err);
            setError("Unexpected error during Facebook login.");
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleFacebookLogin}
                disabled={!isSDKLoaded}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                Sign in with Facebook
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}