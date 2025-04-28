"use client";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from "react-facebook-login";
import TwitterLogin from "react-twitter-auth";

import dayjs from "dayjs";
import Image from "next/image";

const googleId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const twitterConsumerKey = process.env.NEXT_PUBLIC_TWITTER_CONSUMER_KEY;
const twitterConsumerSecret = process.env.NEXT_PUBLIC_TWITTER_CONSUMER_SECRET;

export default function Auth() {
    const [isClient, setIsClient] = useState(false);
    const [time, setTime] = useState(null);
    const [date, setDate] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsClient(true);
        setTime(Date.now());
        setDate(dayjs().format("YYYY-MM-DD"));
    }, []);

    // Google Login Success
    const handleGoogleSuccess = (response) => {
        const token = response.credential;
        console.log("Google Login Success:", response);
        // Handle the token as needed
    };

    // Google Login Error
    const handleGoogleError = () => {
        setError("Google login failed. Please try again.");
        console.error("Google Login Failed");
    };

    // Facebook Login Success
    const handleFacebookResponse = (response) => {
        console.log("Facebook Login Success:", response);
        // Handle the response as needed
    };

    // Facebook Login Error
    const handleFacebookError = (response) => {
        setError("Facebook login failed. Please try again.");
        console.error("Facebook Login Failed:", response);
    };

    // Twitter Login Success
    const handleTwitterResponse = (response) => {
        console.log("Twitter Login Success:", response);
        // Handle the response as needed
    };

    // Twitter Login Error
    const handleTwitterError = (response) => {
        setError("Twitter login failed. Please try again.");
        console.error("Twitter Login Failed:", response);
    };

    if (!isClient || !time || !date) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold mb-4">OAuth Login</h1>

            {/* Google Login */}
            <GoogleOAuthProvider clientId={googleId}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
        />
      </GoogleOAuthProvider>

            {/* Facebook Login */}
            {/* <FacebookLogin
                appId={facebookAppId}
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookResponse}
                cssClass="facebook-login-button"
                icon="fa-facebook"
                onFailure={handleFacebookError}
            /> */}

            {/* Twitter Login */}
            {/* <TwitterLogin
                authCallback={handleTwitterResponse}
                consumerKey={twitterConsumerKey}
                consumerSecret={twitterConsumerSecret}
                buttonTheme="dark"
                onFailure={handleTwitterError}
            /> */}

            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}